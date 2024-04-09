import { ChangeEvent, useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { db, storage } from "../../services/firebaseConnection";
import { AuthContext } from "../../context/AuthContext";
import { Input } from "../../components/input";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { FiTrash2, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";
import { v4 as uuidV4 } from "uuid";

const schema = z.object({
  km: z.string().min(1, { message: "O KM do carro é obrigatório" }),
  price: z.string().min(1, { message: "O preço é obrigatório" }),
  city: z.string().min(1, { message: "A cidade é obrigatória" }),
  whatsapp: z
    .string()
    .min(1, { message: "O telefone é obrigatório" })
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número de telefone inválido",
    }),
  description: z.string().min(1, { message: "A descrição é obrigatória" }),
});

type FormData = z.infer<typeof schema>;

interface CarProps {
  id: string;
  name: string;
  model: string;
  year: string;
  price: string | number;
  km: string;
  city: string;
  description: string;
  created: string;
  owner: string;
  uid: string;
  whatsapp: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

interface imageUploadProps {
  name: string;
  uid: string;
  url: string;
  previewUrl: string;
}

export function Edit() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [cars, setCars] = useState<CarProps>();
  const [disabledInput, setDisabledInput] = useState(true);
  const [imageUpload, setImageUpload] = useState<imageUploadProps[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    criteriaMode: "all",
  });

  useEffect(() => {
    async function loadCar() {
      if (!id) return;

      const carRef = doc(db, "cars", id);
      const carSnap = await getDoc(carRef);

      if (!carSnap.exists()) {
        navigate("/");
      }

      if (carSnap.exists()) {
        setCars({
          id: carSnap.id,
          name: carSnap.data()?.name,
          model: carSnap.data()?.model,
          year: carSnap.data()?.year,
          price: carSnap.data()?.price,
          km: carSnap.data()?.km,
          city: carSnap.data()?.city,
          description: carSnap.data()?.description,
          created: carSnap.data()?.created,
          owner: carSnap.data()?.owner,
          uid: carSnap.data()?.uid,
          whatsapp: carSnap.data()?.whatsapp,
          images: carSnap.data()?.images,
        });
      }
    }

    loadCar();
  }, [id, navigate]);

  function handleEdit() {
    setDisabledInput(false);
  }

  function handleUpdate(data: FormData) {
    if (imageUpload.length === 0) {
      toast.error("Você precisa enviar pelo menos uma imagem do carro!");
      return;
    }

    const carListImages = imageUpload.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });

    const ref = doc(db, "cars", id as string);
    updateDoc(ref, {
      price: data.price,
      km: data.km,
      city: data.city,
      description: data.description,
      uid: user?.uid,
      whatsapp: data.whatsapp,
      images: carListImages,
    })
      .then(async () => {
        // Excluir imagens antigas do armazenamento
        if (cars && cars.images) {
          const deletePromises = cars.images.map(async (image) => {
            const imagePath = `images/${image.uid}/${image.name}`;
            const imageRef = storageRef(storage, imagePath);
            try {
              await deleteObject(imageRef);
            } catch (err) {
              console.log("Erro ao deletar imagem", err);
            }
          });
          await Promise.all(deletePromises);
        }

        reset();
        setImageUpload([]);
        toast.success("Carro atualizado com sucesso!");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Erro ao atualizar o carro!");
      });
  }

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        // Enviar imagem ao banco
        if (imageUpload.length < 5) {
          await handleUpload(image);
        } else {
          toast.error("Você atingiu o limite de 5 imagens por carro!");
        }
      } else {
        toast.error("Envie imagens do tipo PNG ou JPEG!");
      }
    }
  }

  async function handleUpload(image: File) {
    if (!user?.uid) {
      return;
    }

    const currentUid = user?.uid;
    const uidImage = uuidV4();

    const uploadRef = storageRef(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        };

        setImageUpload([...imageUpload, imageItem]);
      });
    });
  }

  async function handleDeleteImage(item: imageUploadProps) {
    const imagePath = `images/${item.uid}/${item.name}`;

    const imageRef = storageRef(storage, imagePath);

    try {
      await deleteObject(imageRef);

      // Remover a imagem da lista
      setImageUpload((prevCarImages) => prevCarImages.filter((image) => image.url !== item.url));
    } catch (err) {
      console.log("Erro ao deletar", err);
    }
  }

  return (
    <Container>
      <div className="flex justify-center items-center">
        <div className="flex justify-center items-center py-3 bg-white rounded-lg my-3 w-2/3 shadow-md ">
          <h1 className="text-2xl font-semibold mobile:text-base ">Editar Informações</h1>
        </div>
      </div>

      {disabledInput && (
        <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
          {cars?.images.map((car) => (
            <div key={car.uid} className="w-full h- flex items-center justify-center ">
              <img src={car.url} className="rounded-lg w-full h-48 object-cover" alt={car.name} />
            </div>
          ))}
        </div>
      )}

      {!disabledInput && (
        <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2">
          <div className="cursor-pointer w-52 h-48 flex items-center justify-center border-2 border-gray-950 border-dashed rounded-lg bg-gray-50 hover:bg-gray-200 transition-colors mobile:w-52 ">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-32 cursor-pointer tablet:w-52 laptops:w-52 desktop:w-52 tv:w-52"
            >
              <FiUpload size={30} color="#000" />
              <span className="text-base text-gray-600 font-semibold">Upload</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="dropzone-file"
                onChange={handleFile}
              />
            </label>
          </div>

          {imageUpload.map((item) => (
            <div key={item.name} className="w-full h- flex items-center justify-center relative">
              <button
                className="absolute bg-slate-300 rounded-full right-3 top-3 p-1.5 flex items-center justify-center drop-shadow hover:bg-gray-100 hover:scale-105 transition-all"
                onClick={() => handleDeleteImage(item)}
              >
                <FiTrash2 size={20} color="#000" />
              </button>
              <img
                src={item.previewUrl}
                className="rounded-lg w-full h-48 object-cover"
                alt="Foto do carro"
              />
            </div>
          ))}
        </div>
      )}

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-4 mt-2">
        <form className="w-full" onSubmit={handleSubmit(handleUpdate)}>
          <div className="flex w-full mb-3 flex-col items-center gap-2 mobile:flex-col">
            <label className=" font-semibold w-full">
              KM rodados
              <Input
                type="text"
                register={register}
                rules={{ disabled: disabledInput }}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900..."
                disabled={disabledInput}
              />
            </label>
          </div>

          <div className="flex w-full mb-3 flex-col items-center gap-2 mobile:flex-col">
            <label className="font-semibold w-full">
              Telefone
              <Input
                type="text"
                register={register}
                name="whatsapp"
                rules={{ disabled: disabledInput }}
                error={errors.whatsapp?.message}
                placeholder="Ex: 12 99988-7777..."
                disabled={disabledInput}
              />
            </label>

            <label className="font-semibold w-full">
              Cidade
              <Input
                type="text"
                register={register}
                rules={{ disabled: disabledInput }}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Redenção da Serra..."
                disabled={disabledInput}
              />
            </label>

            <label className="font-semibold w-full">
              Valor
              <Input
                type="text"
                register={register}
                rules={{ disabled: disabledInput }}
                name="price"
                error={errors.price?.message}
                placeholder="Ex: 23.900..."
                disabled={disabledInput}
              />
            </label>
          </div>

          <label className="font-semibold">
            Descrição
            <textarea
              className="border-2 w-full rounded-md h-40 px-2 resize-none focus:outline-none "
              {...register("description", {
                disabled: disabledInput,
              })}
              name="description"
              id="description"
              placeholder="Digite a descrição completa do seu carro..."
            />
            {errors.description && (
              <p className="text-red-600 pt-2 font-medium">{errors.description.message}</p>
            )}
          </label>

          <div className="flex justify-center items-center gap-2 mt-3">
            {disabledInput && (
              <button
                type="button"
                onClick={handleEdit}
                className="h-12 w-1/3 rounded-md bg-zinc-900 text-white font-semibold  hover:bg-zinc-600 transition-colors"
              >
                Editar
              </button>
            )}

            {!disabledInput && (
              <button
                type="submit"
                disabled={disabledInput}
                className="h-12 w-1/3 rounded-md bg-zinc-900 text-white font-semibold  hover:bg-zinc-600 transition-colors"
              >
                Atualizar
              </button>
            )}
          </div>
        </form>
      </div>
    </Container>
  );
}
