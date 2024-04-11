import { ChangeEvent, useContext, useState } from "react";
import { Container } from "../../../components/container";
import { DashboardHeader } from "../../../components/dashboard-header";

import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useForm } from "react-hook-form";
import { FiTrash2, FiUpload } from "react-icons/fi";
import { v4 as uuidV4 } from "uuid";
import { z } from "zod";
import { Input } from "../../../components/input";

import { AuthContext } from "../../../context/AuthContext";
import { db, storage } from "../../../services/firebaseConnection";

import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "O campo é obrigatório"),
  model: z.string().min(1, "O modelo é obrigatório"),
  year: z.string().min(1, "O ano do carro é obrigatório"),
  km: z.string().min(1, "O KM do carro é obrigatório"),
  price: z.string().min(1, "O preço é obrigatório"),
  city: z.string().min(1, "A cidade é obrigatória"),
  whatsapp: z
    .string()
    .min(1, "O telefone é obrigatório")
    .refine((value) => /^(\d{11,12})$/.test(value), {
      message: "Número de telefone inválido",
    }),
  description: z.string().min(1, "A descrição é obrigatória"),
});

type FormData = z.infer<typeof schema>;

interface ImageItemProps {
  uid: string;
  name: string;
  previewUrl: string;
  url: string;
}

export function New() {
  const { user } = useContext(AuthContext);
  const [carImage, setCarImage] = useState<ImageItemProps[]>([]);

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

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const image = e.target.files[0];

      if (image.type === "image/jpeg" || image.type === "image/png") {
        // Enviar imagem ao banco
        if (carImage.length < 5) {
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

    const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`);

    uploadBytes(uploadRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadUrl) => {
        const imageItem = {
          name: uidImage,
          uid: currentUid,
          previewUrl: URL.createObjectURL(image),
          url: downloadUrl,
        };

        setCarImage((images) => [...images, imageItem]);
      });
    });
  }

  function onSubmit(data: FormData) {
    if (carImage.length === 0) {
      toast.error("Você precisa enviar pelo menos uma imagem do carro!");
      return;
    }

    const carListImages = carImage.map((car) => {
      return {
        uid: car.uid,
        name: car.name,
        url: car.url,
      };
    });

    addDoc(collection(db, "cars"), {
      name: data.name.toUpperCase(),
      model: data.model,
      whatsapp: data.whatsapp,
      city: data.city,
      year: data.year,
      km: data.km,
      price: data.price,
      description: data.description,
      created: new Date(),
      owner: user?.name,
      uid: user?.uid,
      images: carListImages,
    })
      .then(() => {
        reset();
        setCarImage([]);
        toast.success("Carro cadastrado com sucesso!");
      })
      .catch((error) => {
        console.log(error);
        toast.error("Erro ao cadastrar o carro!");
      });
  }

  async function handleDeleteImage(item: ImageItemProps) {
    const imagePath = `images/${item.uid}/${item.name}`;

    const imageRef = ref(storage, imagePath);

    try {
      await deleteObject(imageRef);

      // Remover a imagem da lista
      setCarImage((prevCarImages) => prevCarImages.filter((image) => image.url !== item.url));
    } catch (err) {
      console.log("Erro ao deletar", err);
    }
  }

  return (
    <Container>
      <DashboardHeader />
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

        {carImage.map((item) => (
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

      <div className="w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-4 mt-2">
        <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full mb-3 flex-col items-center gap-2 mobile:flex-col">
            <label className="font-semibold w-full">
              Nome do carro
              <Input
                type="text"
                register={register}
                name="name"
                error={errors.name?.message}
                placeholder="Ex: Onix 1.0..."
              />
            </label>

            <label className="font-semibold w-full">
              Modelo do carro
              <Input
                type="text"
                register={register}
                name="model"
                error={errors.model?.message}
                placeholder="Ex: 1.0 Flex Plus Manual..."
              />
            </label>
          </div>

          <div className="w-full h-px bg-slate-300 my-2"></div>

          <div className="flex w-full mb-3 flex-col items-center gap-2 mobile:flex-col">
            <label className=" font-semibold w-full ">
              Ano
              <Input
                type="text"
                register={register}
                name="year"
                error={errors.year?.message}
                placeholder="Ex: 2019/2019..."
              />
            </label>

            <label className=" font-semibold w-full">
              KM rodados
              <Input
                type="text"
                register={register}
                name="km"
                error={errors.km?.message}
                placeholder="Ex: 23.900..."
              />
            </label>
          </div>

          <div className="w-full h-px bg-slate-300 my-2"></div>

          <div className="flex w-full mb-3 flex-col items-center gap-2 mobile:flex-col">
            <label className="font-semibold w-full">
              Telefone
              <Input
                type="text"
                register={register}
                name="whatsapp"
                error={errors.whatsapp?.message}
                placeholder="Ex: 12 99988-7777..."
              />
            </label>

            <label className="font-semibold w-full">
              Cidade
              <Input
                type="text"
                register={register}
                name="city"
                error={errors.city?.message}
                placeholder="Ex: Redenção da Serra..."
              />
            </label>

            <label className="font-semibold w-full">
              Valor
              <Input
                type="text"
                register={register}
                name="price"
                error={errors.price?.message}
                placeholder="Ex: 23.900..."
              />
            </label>
          </div>

          <div className="w-full h-px bg-slate-300 my-2"></div>

          <label className="font-semibold">
            Descrição
            <textarea
              className="border-2 w-full rounded-md h-40 px-2 resize-none focus:no-underline"
              {...register("description")}
              name="description"
              id="description"
              placeholder="Digite a descrição completa do seu carro..."
            />
            {errors.description && (
              <p className="text-red-600 pt-2 font-medium">{errors.description.message}</p>
            )}
          </label>

          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="w-2/4 h-12 rounded-md bg-zinc-900 text-white font-semibold mt-10 hover:bg-zinc-600 transition-colors"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
}
