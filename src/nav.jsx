import React from "react";
import "./nav.css";
import "./App.css";
import { Link, useNavigate } from "react-router-dom";

function navbar() {
  const navigate = useNavigate();
  return (
    <div class="navbar bg-base-100" id="nav">
      <div class="navbar-start">
        <div class="dropdown">
          <div tabindex="0" role="button" class="btn btn-primary btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>

          <ul
            tabindex="0"
            class="menu menu-sm dropdown-content bg-base-200 rounded-box z-[1] mt-6 ml-1 w-63 h-75 p-5 shadow"
          >
            <nav>
              <li class="mt-1 mb-2">
                <Link to="/matches">Match Search</Link>
              </li>
              <li class="mt-1 mb-2">
                <Link to="/players">Player Search</Link>
              </li>
              <li class="mt-1 mb-2">
                <Link to="/ranking">Rankings</Link>
              </li>
              <li class="mt-1 mb-2">
                <Link to="/tournaments">Tournaments</Link>
              </li>
              <li class="mb-2">
                <Link to="/favorites">Favorites</Link>
              </li>
            </nav>
          </ul>
        </div>
      </div>
      <div class="navbar-center">
        <Link to="/" class="btn btn-ghost text-xl">
          tennis
        </Link>
      </div>
      <div class="navbar-end">
        <div>
          <button
            tabindex="0"
            class="btn btn-accent btn-circle w-80 pl-2 pr-2"
            id="search"
            onClick={() => {
              navigate("/recommend");
            }}
          >
            Find more players?
          </button>
        </div>
      </div>
    </div>
  );
}

export default navbar;
