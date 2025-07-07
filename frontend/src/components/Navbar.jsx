import React from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Smartphone,
  Compass,
} from "lucide-react";
export const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">Chamo</h1>
            </Link>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            {!authUser && (
              <>
                <Link to={"/"} className={`btn btn-sm btn-ghost`}>
                  <Smartphone className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Sign In</span>
                </Link>
                <Link to={"/help"} className={`btn btn-sm btn-ghost`}>
                  <HelpCircle className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Help</span>
                </Link>
              </>
            )}

            {authUser && (
              <>
                <Link to={"/explore"} className={`btn btn-sm btn-ghost`}>
                  <Compass className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Explore</span>
                </Link>
                <Link to={"/profile"} className={`btn btn-sm btn-ghost`}>
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Profile</span>
                </Link>
                <Link to={"/"} className={`btn btn-sm btn-ghost`}>
                  <MessageSquare className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Chat</span>
                </Link>
                <Link to={"/settings"} className={`btn btn-sm btn-ghost`}>
                  <Settings className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Settings</span>
                </Link>
                <Link to={"/help"} className={`btn btn-sm btn-ghost`}>
                  <HelpCircle className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Help</span>
                </Link>
                <button className="btn btn-sm btn-ghost" onClick={logout}>
                  <LogOut className="w-5 h-5" />
                  <span className="hidden md:inline ml-1">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
