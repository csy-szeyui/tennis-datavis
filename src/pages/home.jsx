import "./home.css";
import Chart from "./chart/ranking_line.jsx";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearfavorites } from "./redux/playerstore.jsx";

export default function home() {
  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(0);
  const [ranking10, setRanking] = useState([]);
  const [chart, setChart] = useState(0);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState({});

  const favorites = useSelector((state) => state.favorites.favorites);
  const dispatch = useDispatch();
  const clear_favorites = () => {
    dispatch(clearfavorites());
  };

  const reloadchart = () => {
    setChart((prev) => prev + 1);
  };

  useEffect(() => {
    const fetch10Rank = async () => {
      try {
        console.log("load");
        setLoading(true);
        const response2 = await axios.get(
          "http://localhost:5000/rankings/top10"
        );
        setRanking(response2.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top 10 rankings:", error);
      }
    };

    fetch10Rank();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/top10");
        setPlayers(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPlayers();
  }, [loading]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response3 = await axios.get("http://localhost:5000/record/rand");
        setMatch(response3.data[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchMatch();
  }, []);

  const switchPage = (page) => {
    setPage(page);
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

  const top = page * 5;
  const bottom = top + 5;
  const display = players.slice(top, bottom);

  const navigate = useNavigate();
  const gomatch = () => navigate(`/matches/${match.match_id}`);
  const gorank = () => navigate("/ranking");
  const gofav = () => navigate("/favorites");

  return (
    <>
      <div id="con1">
        <div class="card bg-base-100 shadow-xl" id="ranking">
          <div class="card-body">
            <h2 class="card-title">Year-end Top 10</h2>
            <div class="table-md">
              <table class="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((player) => (
                    <tr class="hover:bg-base-300" key={player.rank}>
                      <td>{player.rank}</td>
                      <td>
                        <Link to={`/players/${player.player}`}>
                          {player.name_first} {player.name_last}
                        </Link>
                      </td>
                      <td>{player.ioc}</td>
                      <td>{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div class="card-actions justify-end">
              <button
                class="btn btn-sm btn-primary"
                onClick={() => switchPage(0)}
              >
                1-5
              </button>
              <button
                class="btn btn-sm btn-primary"
                onClick={() => switchPage(1)}
              >
                6-10
              </button>
            </div>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl" id="rankvis">
          <div class="card-body">
            <h2 class="card-title">Top 10 Rankings</h2>
            <Chart key={chart} data={ranking10} width={950} height={275} />
            <div class="card-actions justify-end">
              <button class="btn btn-sm btn-primary" onClick={() => gorank()}>
                Rankings
              </button>
              <button class="btn btn-sm btn-primary" onClick={reloadchart}>
                Reload
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="con2">
        <div class="card bg-base-100 shadow-xl" id="fav">
          <div class="card-body overflow-y-auto">
            <h2 class="card-title">Favorite Players</h2>
            <div class="table-md">
              <table class="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.length > 0 ? (
                    favorites.map((favd) => (
                      <tr class="hover:bg-base-300" key={favd.playerid}>
                        <td>
                          <Link to={`/players/${favd.playerid}`}>
                            {favd.name}
                          </Link>
                        </td>
                        <td>{favd.ioc}</td>
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
            <div class="card-actions justify-end">
              <button class="btn btn-sm btn-error" onClick={clear_favorites}>
                Clear Favorites
              </button>
              <button class="btn btn-sm btn-primary" onClick={() => gofav()}>
                Favorites
              </button>
            </div>
          </div>
        </div>
        <div class="card bg-base-100 shadow-xl" id="match">
          <div class="card-body">
            <h2 class="card-title">You Might Like</h2>
            <div class="rand">
              {match && match.match_id ? (
                <>
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
                </>
              ) : (
                <span class="loading loading-dots loading-lg load bg-neutral"></span>
              )}
            </div>
            <div class="card-actions justify-end">
              <button class="btn btn-sm btn-primary" onClick={() => gomatch()}>
                See Match
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
