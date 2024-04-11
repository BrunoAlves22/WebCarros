import { useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { FiEye, FiEyeOff } from "react-icons/fi";
import logoImg from "../../assets/logo.svg";
import { Container } from "../../components/container";
import { Input } from "../../components/input";
import { AuthContext } from "../../context/AuthContext";

import { createUserWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(1, "O campo é obrigatório"),
  email: z.string().email("Insira um email válido").min(1, "O campo é obrigatório"),
  password: z
    .string()
    .min(1, "O campo é obrigatório")
    .min(6, "A senha deve ter 6 ou mais caracteres"),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const { showPassword, visiblePassword, handleInfoUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth);
    }

    handleLogout();
  }, []);

  async function onSubmit(data: FormData) {
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then(async (user) => {
        await updateProfile(user.user, {
          displayName: data.name,
        });

        handleInfoUser({
          name: data.name,
          email: data.email,
          uid: user.user.uid,
        });
        console.log("Cadastrado com Sucesso");
        toast.success("Cadastrado com sucesso");
        navigate("/dashboard", { replace: true });
      })
      .catch((error) => {
        console.log("Erro ao cadastrar o usuário");
        console.log(error);
        toast.error("Erro ao cadastrar o usuário");
      });
  }

  return (
    <Container>
      <div className="w-full min-h-screen flex justify-center items-center flex-col gap-4">
        <Link to="/" className="mb-6 max-w-sm w-full">
          <img src={logoImg} alt="Logo do Site" className="w-full" />
        </Link>

        <form className="bg-white max-w-xl w-full rounded-lg p-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <Input
              type="text"
              placeholder="Digite seu nome..."
              name="name"
              error={errors.name?.message}
              register={register}
            />
          </div>

          <div className="mb-3">
            <Input
              type="email"
              placeholder="Digite seu email..."
              name="email"
              error={errors.email?.message}
              register={register}
            />
          </div>

          <div className="mb-3 ">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha..."
              name="password"
              error={errors.password?.message}
              register={register}
              icon={
                <div onClick={visiblePassword} className="cursor-pointer ">
                  {showPassword ? (
                    <FiEye size={20} color="##a0a0a0" />
                  ) : (
                    <FiEyeOff size={20} color="##a0a0a0" />
                  )}
                </div>
              }
            />
          </div>

          <button
            type="submit"
            className="bg-zinc-900 w-full rounded-md text-white h-10 font-semibold"
          >
            Cadastrar
          </button>
        </form>
        <Link to="../login">Já possui uma conta? Faça o login!</Link>
      </div>
    </Container>
  );
}
