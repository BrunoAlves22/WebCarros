import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebaseConnection";

export function DashboardHeader() {
  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="w-full items-center flex h-10 bg-red-600 rounded-lg text-white font-semibold gap-4 px-4 mb-4 mobile:px-2">
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/dashboard/new">Cadastrar</Link>

      <button className="ml-auto mr-2" onClick={handleLogout}>
        Sair
      </button>
    </div>
  );
}
