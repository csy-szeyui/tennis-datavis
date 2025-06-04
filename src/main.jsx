import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Ranking from "./pages/ranking/ranking.jsx";
import Tournaments from "./pages/tourney/tourney.jsx";
import Home from "./pages/home";
import Players from "./pages/players/players.jsx";
import Profile_p from "./pages/players/pprofile/pprofile.jsx";
import Profile_m from "./pages/match/mprofile/mprofile.jsx";
import Matches from "./pages/match/matches.jsx";
import Favorites from "./pages/favorite/fav.jsx";
import Recommend from "./pages/reco/reco.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Home />} />
        <Route path="ranking" element={<Ranking />} />
        <Route path="tournaments" element={<Tournaments />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:playerid" element={<Profile_p />} />
        <Route path="matches" element={<Matches />} />
        <Route path="matches/:matchid" element={<Profile_m />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="recommend" element={<Recommend />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
