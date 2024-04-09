import { useContext } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiLogIn } from "react-icons/fi";

import logoImg from "../../assets/logo.svg";
import { AuthContext } from "../../context/AuthContext";

export function Header() {
  const { signed, loadingAuth, user } = useContext(AuthContext);

  return (
    <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4 sticky top-0 z-40">
      <header className="flex w-full items-center justify-between max-w-7xl px-4 mx-auto">
        <Link to={"/"}>
          <img src={logoImg} alt="Logo do Site" />
        </Link>

        {!loadingAuth && signed && (
          <Link to="/dashboard">
            <div className="rounded-full p-1.5 flex flex-row gap-2 items-center hover:bg-gray-100 transition-colors">
              <FiUser size={24} color="#000" />
              <p className="text-base font-500">{user?.name}</p>
            </div>
          </Link>
        )}

        {!loadingAuth && !signed && (
          <Link to="/dashboard">
            <div className="rounded-full p-1.5 flex flex-row gap-2 items-center hover:bg-gray-100 transition-colors">
              <FiLogIn size={24} color="#000" />
              <p className="text-base font-500">Login</p>
            </div>
          </Link>
        )}
      </header>
    </div>
  );
}
