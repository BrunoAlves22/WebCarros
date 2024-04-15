import { useEffect, useRef, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "../../components/container";
import { currencyMask } from "../../masks/currencymask";

import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebaseConnection";

import { Swiper, SwiperSlide } from "swiper/react";

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

export function Detail() {
  const { id } = useParams();
  const [cars, setCars] = useState<CarProps>();
  const [sliderPerView, setSliderPerView] = useState<number>(3);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSliderPerView(1);
      } else if (window.innerWidth < 1024) {
        setSliderPerView(2);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Container>
      {cars && (
        <Swiper
          slidesPerView={sliderPerView}
          pagination={{ clickable: true }}
          navigation
          className="rounded-lg"
        >
          {cars?.images.map((image) => (
            <SwiperSlide key={image.uid}>
              <img src={image.url} alt={image.name} className="w-full h-80 object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {cars && (
        <main className="w-full bg-white rounded-lg p-6 my-4">
          <div className="flex flex-col mb-4 items-center justify-between sm:flex-row">
            <h1 className="font-bold text-3xl text-black">{cars?.name}</h1>
            <h1 className="font-bold text-3xl text-black">{currencyMask(Number(cars?.price))}</h1>
          </div>

          <p>{cars?.model}</p>

          <div className="flex w-full gap-6 my-4">
            <div className="flex flex-col gap-4">
              <div>
                <p>Cidade</p>
                <strong>{cars?.city}</strong>
              </div>

              <div>
                <p>Ano</p>
                <strong>{cars?.year}</strong>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p>KM</p>
                <strong>{cars?.km} </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <strong>Descrição</strong>
            <p ref={ref} className={`mb-2 ${isOpen ? null : "line-clamp-3 overflow-hidden"}`}>
              {cars?.description}
            </p>

            {cars?.description.length > 200 && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full font-semibold p-1.5 mb-2 hover:bg-gray-300 transition-colors"
              >
                {isOpen ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </div>

          <strong>Contato</strong>
          <div className="flex flex-col justify-center gap-4 py-2 w-32">
            <p>{cars?.whatsapp}</p>
            <a
              href={`https://api.whatsapp.com/send?phone=${cars?.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 px-4 py-2 rounded-md text-white hover:bg-green-600 transition-all duration-200 ease-in-out"
            >
              <FaWhatsapp size={20} />
              <span>Whatsapp</span>
            </a>
          </div>
        </main>
      )}
    </Container>
  );
}
