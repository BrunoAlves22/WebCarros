import { useEffect, useState, useContext } from "react";
import { Container } from "../../components/container";
import { DashboardHeader } from "../../components/dashboard-header";

import { FiTrash2, FiEdit2 } from "react-icons/fi";
import { collection, getDocs, query, where, doc, deleteDoc } from "firebase/firestore";
import { db, storage } from "../../services/firebaseConnection";
import { ref, deleteObject } from "firebase/storage";
import { AuthContext } from "../../context/AuthContext";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

interface CarsProps {
  id: string;
  name: string;
  year: string;
  uid: string;
  price: string | number;
  city: string;
  km: string;
  images: CarImageProps[];
}

interface CarImageProps {
  name: string;
  uid: string;
  url: string;
}

export function Dashboard() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const { user } = useContext(AuthContext);
  const [loadingImages, setLoadingImages] = useState<string[]>([]);

  useEffect(() => {
    function loadCars() {
      if (!user?.uid) return;

      const carsRef = collection(db, "cars");
      const queryRef = query(carsRef, where("uid", "==", user.uid));

      getDocs(queryRef).then((snapshot) => {
        // eslint-disable-next-line prefer-const
        let listcars = [] as CarsProps[];

        snapshot.forEach((doc) => {
          listcars.push({
            id: doc.id,
            name: doc.data().name,
            year: doc.data().year,
            km: doc.data().km,
            city: doc.data().city,
            price: doc.data().price,
            images: doc.data().images,
            uid: doc.data().uid,
          });
        });

        setCars(listcars);
      });
    }

    loadCars();
  }, [user]);

  function handleImageLoad(id: string) {
    setLoadingImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleDeleteCar(car: CarsProps) {
    const itemCar = car;

    const docRef = doc(db, "cars", itemCar.id);
    await deleteDoc(docRef);
    toast.success("Carro deletado com sucesso");

    itemCar.images.map(async (image) => {
      const imageRef = `images/${image.uid}/${image.name}`;
      const storageRef = ref(storage, imageRef);

      try {
        await deleteObject(storageRef);
        setCars(cars.filter((car) => car.id !== itemCar.id));
      } catch (err) {
        console.log("Erro ao deletar imagem: ", err);
      }
    });
  }

  return (
    <Container>
      <DashboardHeader />

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <section key={car.id} className="w-full bg-white rounded-lg relative">
            <button
              onClick={() => handleDeleteCar(car)}
              className="absolute bg-slate-300 rounded-full p-1.5 flex items-center justify-center right-3 top-3 drop-shadow hover:bg-gray-100 hover:scale-105 transition-all"
            >
              <FiTrash2 size={20} color="#000" />
            </button>
            <div
              className="w-full h-72 rounded-lg bg-slate-200"
              style={{ display: loadingImages.includes(car.id) ? "none" : "block" }}
            ></div>
            <img
              className="w-full rounded-lg mb-2 max-h-70 "
              src={car.images[0].url}
              onLoad={() => handleImageLoad(car.id)}
              style={{ display: loadingImages.includes(car.id) ? "block" : "none" }}
            />
            <Link to={`/edit/${car.id}`}>
              <div className="flex flex-row justify-between items-center px-2">
                <p className="font-bold">{car.name}</p>

                <button className=" bg-slate-200 rounded-full p-1.5 flex items-center justify-center drop-shadow hover:bg-gray-300 hover:scale-105 transition-all">
                  <FiEdit2 size={20} color="#000" />
                </button>
              </div>
            </Link>

            <div className="flex flex-col px-2">
              <span className="text-zinc-700 my-4">
                Ano {car.year} | {car.km} KM
              </span>
              <strong className="text-black font-medium text-xl">R$ {car.price}</strong>
            </div>

            <div className="w-full h-px bg-slate-200 my-2" />
            <div className="px-2 pb-2">
              <span className="text-zinc-700">{car.city}</span>
            </div>
          </section>
        ))}
      </main>
    </Container>
  );
}
