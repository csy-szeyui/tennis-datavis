import "./reco.css";
import Chart from "../chart/ranking_line.jsx";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  clearfavorites,
  addfavorite,
  removefavorite,
  reset_matrix,
} from "../redux/playerstore.jsx";

export default function reco() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [players, setPlayers] = useState([]);
  const entries = 5;
  let recoplayer = [];
  const [reload, setReload] = useState(0);
  const favorites = useSelector((state) => state.favorites.favorites);
  const dispatch = useDispatch();
  const matrix = useSelector((state) => state.reco.matrix);

  const top = () => {
    const highest = (entries) => {
      const sort = Object.entries(entries)
        .sort((a, b) => b[1] - a[1])
        .filter(([category, value]) => value > 4);
      if (sort.length < 1) {
        return { category: "", value: 0 };
      }
      if (sort.length < 2 || sort[0][1] > sort[1][1]) {
        return { category: sort[0][0], value: sort[0][1] };
      }
      return { category: "", value: 0 };
    };

    const age = highest(matrix.age);
    const hand = highest(matrix.dominant);
    const bh = highest(matrix.backhand);
    const surface = highest(matrix.surface);

    return {
      age: age.category !== "" ? age.category : null,
      hand: hand.category !== "" ? hand.category : null,
      ohbh:
        bh.category === "ohbh" ? true : bh.category === "thbh" ? false : null,
      surface: surface.category !== "" ? surface.category : null,
    };
  };

  const converter = (original) => {
    if (original === null) {
      return null;
    } else if (original.includes("-")) {
      return parseInt(original.split("-")[1], 10);
    } else {
      return null;
    }
  };

  useEffect(() => {
    const fetchReco = async () => {
      setLoading(true);
      const category = top();
      const query = {};
      query.age = converter(category.age);
      query.hand = category.hand;
      query.ohbh = category.ohbh;
      query.surface = category.surface;

      if (
        query.age === null &&
        query.hand === null &&
        query.ohbh === null &&
        query.surface === null
      ) {
        console.log(
          "Need more data for recommendations, please try again later ._."
        );
        setLoading(false);
        return;
      }
      const para = ["age", "hand", "ohbh", "surface"];
      const retrieved = new Set();
      for (const type of para) {
        if (query[type] !== null) {
          try {
            console.log(`fetching recommendations for ${type}._.`);
            const response = await axios.get(
              "http://localhost:5000/recommend",
              {
                params: { [type]: query[type] },
              }
            );

            let temp_reco = [];

            response.data.forEach((player) => {
              if (!retrieved.has(player.player_id)) {
                temp_reco.push({
                  type: type,
                  filtered: query[type],
                  player,
                });
              }
            });
            const player_2filter = temp_reco.slice(0, 2);
            player_2filter.forEach((player) => {
              recoplayer.push(player);
              retrieved.add(player.player.player_id);
            });
          } catch (error) {
            console.error(`Error fetching recommendations for ${type}:`, error);
          }
        }
      }
      setPlayers(recoplayer);
      setLoading(false);
    };

    fetchReco();
  }, [matrix, reload]);

  useEffect(() => {
    console.log("updated player state:", players);
  }, [players]);

  const total = Math.ceil(favorites.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = favorites.slice(start, end);

  useEffect(() => {
    if (page > 0 && start >= favorites.length) {
      setPage(page - 1);
    }
  }, [favorites, page, start]);

  const favorited = (playerid) =>
    favorites.some((fav) => fav.playerid === playerid);
  const togglefavorite = (playerid, name, ioc) => {
    if (favorites.some((fav) => fav.playerid === playerid)) {
      dispatch(removefavorite(playerid));
    } else {
      dispatch(addfavorite({ playerid: playerid, name: name, ioc: ioc }));
    }
  };

  const format_d = (date_s) => {
    const date = new Date(date_s);
    const options = { day: "2-digit", month: "long", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  const format_h = (hand) => {
    const res =
      (hand === "L" ? "Left" : hand === "R" ? "Right" : "Unknown") + "-Handed";
    return res;
  };

  const format_b = (ohbh) => {
    if (ohbh === true) {
      return ", One-Handed Backhand";
    } else {
      return ", Two-Handed Backhand";
    }
  };

  const format_age = (dob) => {
    const age =
      new Date("2023-12-31").getFullYear() - new Date(dob).getFullYear();
    return " (" + age + " years old)";
  };

  const format_he = (height) => {
    return height === null ? "null" : " " + height + "cm";
  };

  const format_c = (type, category) => {
    if (type === "age") {
      return `players in the age group of ${
        category - 5
      }-${category} years old`;
    } else if (type === "hand") {
      return `${category === "R" ? "Right" : "Left"}-handed players`;
    } else if (type === "ohbh") {
      return `players with ${category ? "One-handed" : "Two-handed"} Backhand`;
    } else if (type === "surface") {
      return `players who did well on ${category} courts`;
    }
  };

  return (
    <>
      <div id="reco_con">
        <div class="card bg-base-100 shadow-xl" id="reco_con2">
          <div class="card-body">
            <div class="head">
              <h2 class="card-title">Players you might like</h2>
              <div id="reco_button">
                <button
                  class="btn btn-primary reloadreco"
                  onClick={() => setReload((prev) => prev + 1)}
                >
                  Reload
                </button>
                <div class="dropdown">
                  <button
                    class="btn btn-warning"
                    onClick={() => {
                      dispatch(reset_matrix());
                      setPlayers([]);
                    }}
                  >
                    Clear Record
                  </button>
                  <div
                    tabindex="0"
                    class="dropdown-content card card-sm bg-base-200 z-1 w-30 mt-1 shadow-md"
                  >
                    <div class="card-body">
                      <p style={{ textAlign: "center" }}>
                        Search Record Cleared
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <>
              {loading ? (
                <div class="message">
                  <span class="loading loading-dots loading-lg load bg-neutral"></span>
                </div>
              ) : players.length > 0 ? (
                <div id="player_result">
                  {players.map((entry, index) => (
                    <div
                      class="card-body bg-base-200 shadow-sm search_card_p"
                      key={index}
                    >
                      <Link to={`/players/${entry.player.player_id}`}>
                        <strong class="pname_link">
                          {entry.player.player_name}
                        </strong>
                      </Link>

                      <p>{entry.player.country}</p>
                      <p>
                        {format_h(entry.player.hand)}
                        {format_b(entry.player.ohbh)}
                      </p>
                      <p>
                        {format_d(entry.player.dob)}
                        {format_age(entry.player.dob)}
                      </p>
                      <p>
                        {entry.player.height !== null &&
                          format_he(entry.player.height)}
                      </p>
                      <button
                        class={`btn btn-sm ${
                          favorited(entry.player.player_id)
                            ? "btn-error"
                            : "btn-neutral"
                        }`}
                        onClick={() =>
                          togglefavorite(
                            entry.player.player_id,
                            entry.player.player_name,
                            entry.player.ioc
                          )
                        }
                      >
                        {favorited(entry.player.player_id)
                          ? "Unfavorite"
                          : "Favorite"}
                      </button>
                      <p>
                        Because you searched for{" "}
                        {format_c(entry.type, entry.filtered)}{" "}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div class="message">
                  <p>
                    Need more data for recommendations, please try again later
                    ._.
                  </p>
                </div>
              )}
            </>
          </div>
        </div>
      </div>
    </>
  );
}
