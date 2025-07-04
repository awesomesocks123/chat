import React, { useState } from "react";
import ExploreContent from "./ExploreContent";

const ExploreNav = () => {
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Gaming");
  
  const categories = ["Gaming", "Music", "Movie", "TV Show"];
  
  return (
    <div className="flex flex-col">
      <div className="pt-20">
        <div className="flex justify-center items-center">
          <div className="navbar bg-base-200 shadow-sm max-w-5xl w-full rounded-2xl">
            <div className="navbar-start">
              <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </div>
              </div>
              <a className="btn btn-ghost text-xl">Explore</a>
            </div>
            <div className="navbar-center hidden lg:flex">
              <div className="tabs tabs-boxed bg-base-200">
                {categories.map(category => (
                  <a 
                    key={category}
                    className={`tab ${activeTab === category ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab(category)}
                  >
                    {category}
                  </a>
                ))}
              </div>
            </div>
            <div className="navbar-end px-3">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="input input-bordered w-40 pr-10" 
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <div 
                  className="absolute right-3 top-3 cursor-pointer text-gray-500 hover:text-gray-700"
                  onClick={() => searchText ? setSearchText("") : null}
                >
                  {searchText ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content area for the selected tab */}
      <div className="container mx-auto mt-6 px-4">
        <ExploreContent category={activeTab} />
      </div>
    </div>
  );
};

export default ExploreNav;