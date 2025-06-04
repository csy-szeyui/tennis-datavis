import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./pprofile.css";
import RankChart from "../../chart/ranking_line.jsx";
import Breakdown from "../../chart/tourney_breakdown.jsx";
import TotalStat from "../../chart/total_stats.jsx";
import AvgStat from "../../chart/avg_stats.jsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addfavorite,
  removefavorite,
  update_reco,
} from "../../redux/playerstore";

export default function pprofile() {
  let { playerid } = useParams();
  const [player, setPlayer] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [stattotal, setStattotal] = useState([]);
  const [display, setDisplay] = useState([]);
  const [statavg, setStatavg] = useState([]);
  const [ppropen, setPpropen] = useState(true);
  const [ppbopen, setPpbopen] = useState(false);
  const [pptopen, setPptopen] = useState(false);
  const [ppaopen, setPpaopen] = useState(false);
  const [ppreopen, setPpreopen] = useState(false);
  const [favsur, setFavsur] = useState([]);
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const roundorder = [
    "Final",
    "Semifinal",
    "Quarterfinal",
    "Round of 16",
    "Round of 32",
    "Round of 64",
    "Round of 128",
    "Round Robin",
  ];
  const entries = 7;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);

  const favorited = (playerid) =>
    favorites.some((fav) => fav.playerid === playerid);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/pprofile/${playerid}`
        );
        const response2 = await axios.get(
          `http://localhost:5000/prefer/${playerid}`
        );
        setPlayer(response.data[0]);
        if (response2.data && response2.data.length > 0) {
          setFavsur(response2.data[0].surface);
        } else {
          console.error("Invalid response from /prefer API:", response2.data);
        }
        if (response.data[0]) {
          const playermatrix = [
            [
              response.data[0].player_id,
              new Date().getFullYear() -
                new Date(response.data[0].dob).getFullYear(),
              response.data[0].hand,
              response.data[0].ohbh ? "ohbh" : "thbh",
              response2.data[0].surface,
            ],
          ];
          dispatch(update_reco(playermatrix));
        }
      } catch (error) {
        console.error("Error fetching player data:", error);
      }
    };
    fetchPlayer();
    const fetchRanking = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/rankings/${playerid}`
        );
        setRanking(response.data);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };
    const fetchBreakdown = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/breakdown/${playerid}`
        );
        setBreakdown(response.data);
      } catch (error) {
        console.error("Error fetching breakdown data:", error);
      }
    };

    const fetchtotalstats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stats/total/${playerid}`
        );
        setStattotal(response.data);
      } catch (error) {
        console.error("Error fetching stat (total) data:", error);
      }
    };

    const fetchavgstats = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/stats/avg/${playerid}`
        );
        setStatavg(response.data);
      } catch (error) {
        console.error("Error fetching stat (average) data:", error);
      }
    };

    const fetchmatch = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/record/${playerid}`
        );
        setDisplay(response.data);
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchRanking();
    fetchBreakdown();
    fetchtotalstats();
    fetchavgstats();
    fetchmatch();
    setLoading(false);
  }, [playerid, dispatch]);

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

  const format = (date_s) => {
    const date = new Date(date_s);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  const format_c = (category) => {
    if (category === 2000) {
      return "Grand Slam";
    } else if (category === 1500) {
      return "ATP Finals";
    } else if (category === 1000) {
      return "Masters 1000";
    } else if (category === 500) {
      return "ATP 500";
    } else if (category === 250) {
      return "ATP 250";
    } else if (category === null) {
      return "United Cup";
    }
  };

  const format_r = (round) => {
    if (round === "F") {
      return "Final";
    } else if (round === "SF") {
      return "Semifinal";
    } else if (round === "QF") {
      return "Quarterfinal";
    } else if (round === "R16") {
      return "Round of 16";
    } else if (round === "R32") {
      return "Round of 32";
    } else if (round === "R64") {
      return "Round of 64";
    } else if (round === "R128") {
      return "Round of 128";
    } else if (round === "RR") {
      return "Round Robin";
    }
  };

  const format_n = (name, entry, seed) => {
    if (seed !== null || entry !== null) {
      return `[${entry || seed}] ${name}`;
    }
    return name;
  };

  const format_nn = (name, entry, seed) => {
    if (seed !== null || entry !== null) {
      return `[${entry || seed}] ${name}`;
    }
    return name;
  };

  const setbutton = (section) => {
    if (section === "ranking") {
      setPpropen(true);
      setPpbopen(false);
      setPptopen(false);
      setPpaopen(false);
      setPpreopen(false);
    } else if (section === "breakdown") {
      setPpropen(false);
      setPpbopen(true);
      setPptopen(false);
      setPpaopen(false);
      setPpreopen(false);
    } else if (section === "total") {
      setPpropen(false);
      setPpbopen(false);
      setPptopen(true);
      setPpaopen(false);
      setPpreopen(false);
    } else if (section === "avg") {
      setPpropen(false);
      setPpbopen(false);
      setPptopen(false);
      setPpaopen(true);
      setPpreopen(false);
    } else {
      setPpropen(false);
      setPpbopen(false);
      setPptopen(false);
      setPpaopen(false);
      setPpreopen(true);
    }
  };

  const sorting = (key) => {
    setSort((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
    setPage(0);
  };

  const tourney_sort = display.sort((a, b) => {
    if (!sort.key) return 0;

    let a_tour = a[sort.key];
    let b_tour = b[sort.key];

    if (sort.key === "tourney_date") {
      a_tour = new Date(a.tourney_date);
      b_tour = new Date(b.tourney_date);
    }

    if (sort.key === "round") {
      const a_round = roundorder.indexOf(format_r(a_tour));
      const b_round = roundorder.indexOf(format_r(b_tour));
      return sort.direction === "asc" ? a_round - b_round : b_round - a_round;
    }

    if (a_tour < b_tour) return sort.direction === "asc" ? -1 : 1;
    if (a_tour > b_tour) return sort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const nextPage = () => {
    if ((page + 1) * entries < display.length) {
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

  const total = Math.ceil(display.length / entries);
  const start = page * entries;
  const end = start + entries;
  const dis = tourney_sort.slice(start, end);

  const togglefavorite = (playerid, name, ioc) => {
    if (favorites.some((fav) => fav.playerid === playerid)) {
      dispatch(removefavorite(playerid));
    } else {
      dispatch(addfavorite({ playerid: playerid, name: name, ioc: ioc }));
    }
  };

  return (
    <>
      <div id="player_con1">
        <div class="card bg-base-100 shadow-xl" id="player_dis">
          <div class="card-body">
            {loading ? (
              <>
                {console.log("loading")}
                <span class="loading loading-dots loading-lg load bg-neutral"></span>
              </>
            ) : player && player.player_name ? (
              <div>
                <div
                  class="card-body bg-base-200 shadow-sm pp_info_card"
                  key={player.player_id}
                >
                  <strong class="playername">{player.player_name}</strong>
                  <p class="info">
                    {player.country} | {format_h(player.hand)}
                    {format_b(player.ohbh)} | Date of Birth:{" "}
                    {format_d(player.dob)}
                    {format_age(player.dob)} |
                    {player.height !== null && format_he(player.height)}
                  </p>
                  <button
                    class={`btn btn-sm ${
                      favorited(player.player_id) ? "btn-error" : "btn-neutral"
                    }`}
                    onClick={() =>
                      togglefavorite(
                        player.player_id,
                        player.player_name,
                        player.ioc
                      )
                    }
                  >
                    {favorited(player.player_id) ? "Unfavorite" : "Favorite"}
                  </button>
                </div>
                <div class="card-body bg-base-200 shadow-sm pp_ranking_card">
                  <div id={`ppranking ${ppropen ? "open" : ""}`}>
                    {ppropen && (
                      <div>
                        <strong class="playername">Ranking</strong>
                        <div class="pp_rc_container">
                          <RankChart data={ranking} width={1400} height={345} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`ppbreakdown ${ppbopen ? "open" : ""}`}>
                    {ppbopen && (
                      <div>
                        <strong class="playername">Result Breakdown</strong>
                        <div class="pp_rc_container">
                          <Breakdown
                            data={breakdown}
                            width={1400}
                            height={345}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`pptotal ${pptopen ? "open" : ""}`}>
                    {pptopen && (
                      <div>
                        <strong class="playername">Statistics (Total)</strong>
                        <div class="pp_rc_container">
                          <TotalStat
                            data={stattotal}
                            width={1400}
                            height={345}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`ppavg ${ppaopen ? "open" : ""}`}>
                    {ppaopen && (
                      <div>
                        <strong class="playername">Statistics (Average)</strong>
                        <div class="pp_rc_container">
                          <AvgStat data={statavg} width={1400} height={345} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`pprecord ${ppreopen ? "open" : ""}`}>
                    {ppreopen && (
                      <div>
                        <div class="head">
                          <strong class="playername">Previous Matches</strong>
                          <div class="rank_button">
                            <button
                              class="btn btn-sm btn-primary"
                              onClick={prevPage}
                              disabled={page === 0}
                            >
                              prev
                            </button>
                            <select
                              class="btn btn-sm btn-primary"
                              value={page}
                              onChange={switchPage}
                            >
                              {Array.from({ length: total }, (_, index) => (
                                <option key={index} value={index}>
                                  {index + 1}
                                </option>
                              ))}
                            </select>
                            <button
                              class="btn btn-sm btn-primary"
                              onClick={nextPage}
                              disabled={end >= display.length}
                            >
                              next
                            </button>
                          </div>
                        </div>
                        <div class="pp_rc_container">
                          <table class="table">
                            <thead class="bg-base-200">
                              <tr>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("tourney_date")}
                                >
                                  Date
                                </th>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("tourney_name")}
                                >
                                  Tournament
                                </th>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("surface")}
                                >
                                  Surface
                                </th>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("winner_name")}
                                >
                                  Winner
                                </th>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("loser_name")}
                                >
                                  Loser
                                </th>
                                <th
                                  class="tourney_th"
                                  onClick={() => sorting("round")}
                                >
                                  Round
                                </th>
                                <th class="tourney_th">Scoreline</th>
                              </tr>
                            </thead>
                            <tbody>
                              {dis.map((display) => (
                                <tr
                                  class="hover:bg-base-300"
                                  key={display.match_id}
                                >
                                  <td>{format(display.tourney_date)}</td>
                                  <td
                                    class="tooltip tooltip-right"
                                    data-tip={format_c(display.category)}
                                  >
                                    <Link to={`/matches/${display.match_id}`}>
                                      {display.tourney_name}
                                    </Link>
                                  </td>
                                  <td>{display.surface}</td>
                                  <td>
                                    {format_n(
                                      display.winner_name,
                                      display.winner_entry,
                                      display.winner_seed
                                    )}
                                  </td>
                                  <td>
                                    {format_nn(
                                      display.loser_name,
                                      display.loser_entry,
                                      display.loser_seed
                                    )}
                                  </td>
                                  <td>{format_r(display.round)}</td>
                                  <td
                                    class="tooltip tooltip-right"
                                    data-tip={
                                      display.minutes != null
                                        ? display.minutes + " min"
                                        : undefined
                                    }
                                  >
                                    {display.score}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                  <div class="card-actions justify-end">
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbutton("ranking")}
                    >
                      Rankings
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbutton("breakdown")}
                    >
                      Tournament Breakdown
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbutton("total")}
                    >
                      Total Statistics
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbutton("avg")}
                    >
                      Average Statistics
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => {
                        setbutton("record");
                        setSort({ key: null, direction: "asc" });
                        setDisplay([...display]);
                        setPage(0);
                      }}
                    >
                      Match History
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <span class="loading loading-dots loading-lg load bg-neutral"></span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
