import "./fav.css";
import Chart from "../chart/ranking_line.jsx";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  clearfavorites,
  addfavorite,
  removefavorite,
} from "../redux/playerstore.jsx";

export default function Favorite() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [players, setPlayers] = useState([]);
  const entries = 5;

  const favorites = useSelector((state) => state.favorites.favorites);
  const dispatch = useDispatch();
  const clear_favorites = () => {
    dispatch(clearfavorites());
  };
  const favorited = (playerid) =>
    favorites.some((fav) => fav.playerid === playerid);
  const togglefavorite = (playerid, name, ioc) => {
    if (favorites.some((fav) => fav.playerid === playerid)) {
      dispatch(removefavorite(playerid));
    } else {
      dispatch(addfavorite({ playerid: playerid, name: name, ioc: ioc }));
    }
  };

  const reloadchart = () => {
    setChart((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchRank = async () => {
      if (favorites.length === 0) {
        console.log("no favorite players to fetch rankings for ._.");
        setRanking([]);
        return;
      }

      try {
        console.log("fetching rankings for favorite players ._.");
        setLoading(true);

        const rankings = await Promise.all(
          favorites.map((fav) =>
            axios.get(`http://localhost:5000/rankings/${fav.playerid}`)
          )
        );

        const combinefav = rankings.map((response) => response.data);
        const flat = combinefav.flat();
        const formatteddata = flat.reduce((acc, item) => {
          const playerName = Object.keys(item)[0];
          const playerData = item[playerName];

          if (!acc[playerName]) {
            acc[playerName] = [];
          }

          acc[playerName].push(...playerData);
          return acc;
        }, {});
        setRanking(formatteddata);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rankings for favorite players:", error);
        setLoading(false);
      }
    };

    fetchRank();
  }, [favorites]);

  const total = Math.ceil(favorites.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = favorites.slice(start, end);

  useEffect(() => {
    if (page > 0 && start >= favorites.length) {
      setPage(page - 1);
    }
  }, [favorites, page, start]);

  const nextPage = () => {
    if ((page + 1) * entries < favorites.length) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const switchPage = (event) => {
    setPage(Number(event.target.value));
  };

  return (
    <>
      <div id="rank_con1">
        <div class="card bg-base-100 shadow-xl" id="rank_rankvis">
          <div class="card-body">
            <h2 class="card-title">Displaying Favorites</h2>
            <Chart data={ranking} height={255} width={1250} />
            <div class="card-actions justify-end">
              {/* <button class="btn btn-sm btn-primary">Rankings</button> */}
            </div>
          </div>
        </div>
      </div>
      <div id="rank_con2">
        <div class="card bg-base-100 shadow-xl" id="rank_match">
          <div class="card-body">
            <h2 class="card-title">Favorite Players</h2>
            <div class="table-md" id="rank_table-md">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Favorite</th>
                  </tr>
                </thead>
                <tbody>
                  {display.length > 0 ? (
                    display.map((favd) => (
                      <tr class="hover:bg-base-300" key={favd.playerid}>
                        <td>
                          <Link to={`/players/${favd.playerid}`}>
                            {favd.name}
                          </Link>
                        </td>
                        <td>{favd.ioc}</td>
                        <td>
                          <button
                            class={`btn btn-xs ${
                              favorited(favd.playerid)
                                ? "btn-error"
                                : "btn-neutral"
                            }`}
                            onClick={() =>
                              togglefavorite(favd.playerid, favd.name, favd.ioc)
                            }
                          >
                            {favorited(favd.playerid)
                              ? "Unfavorite"
                              : "Favorite"}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: "center" }}>
                        No favorite players added ._.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-actions justify-end buttonf">
            <button
              class="btn btn-sm btn-error"
              onClick={clear_favorites}
              disabled={page.length === 0}
            >
              Clear Favorites
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={prevPage}
              disabled={page === 0}
            >
              prev
            </button>
            <select
              className="btn btn-sm btn-primary"
              value={page}
              onChange={switchPage}
              disabled={favorites.length === 0}
            >
              {Array.from({ length: total }, (_, index) => (
                <option key={index} value={index}>
                  {index + 1}
                </option>
              ))}
            </select>
            <button
              className="btn btn-sm btn-primary"
              onClick={nextPage}
              disabled={end >= favorites.length || favorites.length === 0}
            >
              next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
