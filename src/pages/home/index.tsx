import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container } from "../../components/container";
import { currencyMask } from "../../masks/currencymask";

import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

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

export function Home() {
  const [cars, setCars] = useState<CarsProps[]>([]);
  const [loadingImages, setLoadingImages] = useState<string[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    loadCars();
  }, []);

  function loadCars() {
    const carsRef = collection(db, "cars");
    const queryRef = query(carsRef, orderBy("created", "desc"));

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

  function handleImageLoad(id: string) {
    setLoadingImages((prevImageLoaded) => [...prevImageLoaded, id]);
  }

  async function handleSearchCar() {
    if (search === "") {
      loadCars();
      return;
    }

    setLoadingImages([]);
    setCars([]);

    const carsRef = collection(db, "cars");
    const queryRef = query(
      carsRef,
      where("name", ">=", search.toUpperCase()),
      where("name", "<=", search.toUpperCase() + "\uf8ff")
    );

    await getDocs(queryRef).then((snapshot) => {
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

  return (
    <Container>
      <section className="bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-4 m-10 mobile:p-3 ">
        <input
          placeholder="Digite o nome do carro..."
          className="w-full border-2 rounded-lg h-9 px-3 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={handleSearchCar}
          className="bg-red-500 h-9 px-8 rounded-lg text-white font-semibold text-lg hover:bg-red-600 transition-colors"
        >
          Buscar
        </button>
      </section>

      <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link key={car.id} to={`/detail/${car.id}`}>
            <section className="w-full bg-white rounded-lg">
              <div
                className="w-full h-72 rounded-lg bg-slate-200"
                style={{ display: loadingImages.includes(car.id) ? "none" : "block" }}
              ></div>
              <img
                className="w-full rounded-lg mb-2 max-h-72 hover:scale-105 transition-all"
                src={car.images[0].url}
                alt="Carro"
                onLoad={() => handleImageLoad(car.id)}
                style={{ display: loadingImages.includes(car.id) ? "block" : "none" }}
              />

              <p className="font-bold mt-1 mb-2 px-2">{car.name}</p>

              <div className="flex flex-col px-2">
                <span className="text-zinc-700 mb-6">
                  Ano {car.year} | {car.km} KM
                </span>
                <strong className="text-black font-medium text-xl">
                  {currencyMask(Number(car.price))}
                </strong>
              </div>

              <div className="w-full h-px bg-slate-200 my-2"></div>

              <div className="px-2 pb-2">
                <span className="text-zinc-700">{car.city}</span>
              </div>
            </section>
          </Link>
        ))}
      </main>
    </Container>
  );
}
