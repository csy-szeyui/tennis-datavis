import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./mprofile.css";
import RankChart from "../../chart/ranking_line.jsx";
import MatchStats from "../../chart/match_stats.jsx";
import MatchStats_bp from "../../chart/match_stats_bp.jsx";
import AvgStatw from "../../chart/avg_statsw.jsx";
import AvgStatl from "../../chart/avg_statsl.jsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addfavorite,
  removefavorite,
  update_reco,
} from "../../redux/playerstore";

export default function pprofile() {
  let { matchid } = useParams();
  const [match, setMatch] = useState([]);
  const [player, setPlayer] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [display, setDisplay] = useState([]);
  const [statavgw, setStatavgw] = useState([]);
  const [statavgl, setStatavgl] = useState([]);
  const [ppropen, setPpropen] = useState(true);
  const [ppbopen, setPpbopen] = useState(false);
  const [pptopen, setPptopen] = useState(false);
  const [swopen, setSwopen] = useState(true);
  const [slopen, setSlopen] = useState(false);
  const [ppreopen, setPpreopen] = useState(false);
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favsur, setFavsur] = useState([]);
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
    const fetchMatch = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/match/${matchid}`
        );
        setMatch(response.data[0]);
      } catch (error) {
        console.error("Error fetching match data:", error);
      }
    };

    fetchMatch();
  }, [matchid]);

  useEffect(() => {
    if (match.winner_id && match.loser_id) {
      const fetchPlayer = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `http://localhost:5000/pprofile/${match.winner_id}/${match.loser_id}`
          );
          setPlayer(response.data);
          try {
            const response2 = await axios.get(
              `http://localhost:5000/prefer/${match.winner_id}/${match.loser_id}`
            );

            if (
              response.data &&
              Array.isArray(response.data) &&
              response2.data &&
              Array.isArray(response2.data)
            ) {
              const playermatrix = response.data.map((player) => {
                let surr = "Unknown";
                if (player.player_id === response2.data[0].winner_id) {
                  surr = response2.data[0].w_surface;
                } else if (player.player_id === response2.data[0].loser_id) {
                  surr = response2.data[0].l_surface;
                }

                return [
                  player.player_id,
                  new Date().getFullYear() - new Date(player.dob).getFullYear(),
                  player.hand,
                  player.ohbh ? "ohbh" : "thbh",
                  surr,
                ];
              });
              dispatch(update_reco(playermatrix));
            }
          } catch {
            console.error("Invalid response from /prefer API:", error);
          }
        } catch (error) {
          console.error("Error fetching player data:", error);
        }
      };

      fetchPlayer();
    }
  }, [match]);

  useEffect(() => {
    if (match.winner_id && match.loser_id) {
      const fetchRanking = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/rankings/${match.winner_id}/${match.loser_id}`
          );
          setRanking(response.data);
        } catch (error) {
          console.error("Error fetching ranking data:", error);
        }
      };

      const fetchavgstats = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/stats/avg/${match.winner_id}`
          );
          setStatavgw(response.data);
          const response2 = await axios.get(
            `http://localhost:5000/stats/avg/${match.loser_id}`
          );
          setStatavgl(response2.data);
        } catch (error) {
          console.error("Error fetching stat (average) data:", error);
        }
      };

      const fetchmatch = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/record/${match.winner_id}/${match.loser_id}`
          );
          setDisplay(response.data);
        } catch (error) {
          console.error("Error fetching match data:", error);
        }
      };

      fetchRanking();
      fetchavgstats();
      fetchmatch();
    }
    setLoading(false);
  }, [match.winner_id, match.loser_id]);

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
      return "Semifinals";
    } else if (round === "QF") {
      return "Quarterfinals";
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
    } else if (section === "ranking_sv") {
      setPpropen(false);
      setPpbopen(true);
      setPptopen(false);
    } else {
      setPpropen(false);
      setPpbopen(false);
      setPptopen(true);
    }
  };

  const setbuttona = (section) => {
    if (section === "avgw") {
      setSwopen(true);
      setSlopen(false);
      setPpreopen(false);
    } else if (section === "avgl") {
      setSwopen(false);
      setSlopen(true);
      setPpreopen(false);
    } else {
      setSwopen(false);
      setSlopen(false);
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
            ) : player && player[0] && statavgw && statavgl ? (
              <div>
                <div
                  class="card-body bg-base-200 shadow-sm pp_info_card"
                  key={match.match_id}
                >
                  <strong class="playername">
                    {match.tourney_name} {match.round}: {match.winner_name} VS{" "}
                    {match.loser_name}
                  </strong>
                  <p class="info">
                    <p>
                      {match.sponsored_name} | {format_c(match.category)} |{" "}
                      {format_r(match.round)} | {match.surface}
                    </p>
                    <p>
                      {format_n(
                        match.winner_name,
                        match.winner_entry,
                        match.winner_seed
                      )}{" "}
                      ({match.winner_ioc}) d.{" "}
                      {format_nn(
                        match.loser_name,
                        match.loser_entry,
                        match.loser_seed
                      )}{" "}
                      ({match.loser_ioc}) {match.score}
                    </p>
                  </p>
                </div>
                <div class="player_container">
                  <div
                    class="card-body bg-base-200 shadow-sm pp_player_card_0"
                    key={player[0].player_id}
                  >
                    <strong class="playername">
                      <Link to={`/players/${player[0].player_id}`}>
                        {player[0].player_name}
                      </Link>
                    </strong>
                    <p class="info">
                      {player[0].country} | {format_h(player[0].hand)}
                      {format_b(player[0].ohbh)} | Date of Birth:{" "}
                      {format_d(player[0].dob)}
                      {format_age(player[0].dob)} |
                      {player[0].height !== null && format_he(player[0].height)}
                    </p>
                    <button
                      class={`btn btn-sm ${
                        favorited(player[0].player_id)
                          ? "btn-error"
                          : "btn-neutral"
                      }`}
                      onClick={() =>
                        togglefavorite(
                          player[0].player_id,
                          player[0].player_name,
                          player[0].ioc
                        )
                      }
                    >
                      {favorited(player[0].player_id)
                        ? "Unfavorite"
                        : "Favorite"}
                    </button>
                  </div>
                  <div
                    class="card-body bg-base-200 shadow-sm pp_player_card"
                    key={player[1].player_id}
                  >
                    <strong class="playername">
                      <Link to={`/players/${player[1].player_id}`}>
                        {player[1].player_name}{" "}
                      </Link>
                    </strong>
                    <p class="info">
                      {player[1].country} | {format_h(player[1].hand)}
                      {format_b(player[1].ohbh)} | Date of Birth:{" "}
                      {format_d(player[1].dob)}
                      {format_age(player[1].dob)} |
                      {player[1].height !== null && format_he(player[1].height)}
                    </p>
                    <button
                      class={`btn btn-sm ${
                        favorited(player[1].player_id)
                          ? "btn-error"
                          : "btn-neutral"
                      }`}
                      onClick={() =>
                        togglefavorite(
                          player[1].player_id,
                          player[1].player_name,
                          player[1].ioc
                        )
                      }
                    >
                      {favorited(player[1].player_id)
                        ? "Unfavorite"
                        : "Favorite"}
                    </button>
                  </div>
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
                  <div id={`ppmstats ${ppbopen ? "open" : ""}`}>
                    {ppbopen && (
                      <div>
                        <strong class="playername">
                          Match Statistics (Serve)
                        </strong>
                        <div class="pp_rc_container">
                          <MatchStats data1={match} width={1400} height={345} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`ppmstatsb ${pptopen ? "open" : ""}`}>
                    {pptopen && (
                      <div>
                        <strong class="playername">
                          Match Statistics (Break Point)
                        </strong>
                        <div class="pp_rc_container">
                          <MatchStats_bp
                            data1={match}
                            width={1400}
                            height={345}
                          />
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
                      onClick={() => setbutton("ranking_sv")}
                    >
                      Match Stats (Serve)
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbutton("ranking_bp")}
                    >
                      Match Stats (Breakpoint)
                    </button>
                  </div>
                </div>

                <div class="card-body bg-base-200 shadow-sm pp_ranking_card">
                  <div id={`statw ${swopen ? "open" : ""}`}>
                    {swopen && (
                      <div>
                        <strong class="playername">
                          Seasonal Stats: {match.winner_name}
                        </strong>
                        <div class="pp_rc_container">
                          {statavgw && statavgw.length > 0 ? (
                            <AvgStatw
                              data1={statavgw}
                              data2={match}
                              width={1400}
                              height={345}
                            />
                          ) : (
                            <span class="loading loading-dots loading-lg load bg-neutral"></span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div id={`statl ${slopen ? "open" : ""}`}>
                    {slopen && (
                      <div>
                        <strong class="playername">
                          Seasonal Stats: {match.loser_name}
                        </strong>
                        <div class="pp_rc_container">
                          {statavgl && statavgl.length > 0 ? (
                            <AvgStatl
                              data1={statavgl}
                              data2={match}
                              width={1400}
                              height={345}
                            />
                          ) : (
                            <span class="loading loading-dots loading-lg load bg-neutral"></span>
                          )}
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
                                  <td>{display.winner_name}</td>
                                  <td>{display.loser_name}</td>
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
                      onClick={() => setbuttona("avgw")}
                    >
                      {match.winner_name_last}
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbuttona("avgl")}
                    >
                      {match.loser_name_last}
                    </button>
                    <button
                      class="btn btn-sm btn-neutral"
                      onClick={() => setbuttona("prevmatch")}
                    >
                      Previous Matches (2023)
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
