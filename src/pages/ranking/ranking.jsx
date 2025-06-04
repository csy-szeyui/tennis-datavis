import "./ranking.css";
import Chart from "../chart/ranking_line.jsx";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [players, setPlayers] = useState([]);

  const entries = 20;

  useEffect(() => {
    const fetchRank = async () => {
      try {
        console.log("load");
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/rankings/top10"
        );
        setRanking(response.data);
        console.log("set");

        setLoading(false);
      } catch (error) {
        console.error("Error fetching top 10 rankings:", error);
      }
    };

    fetchRank();
  }, []);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response2 = await axios.get("http://localhost:5000/top200");
        setPlayers(response2.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPlayers();
  }, [loading]);

  const nextPage = () => {
    if ((page + 1) * entries < players.length) {
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

  const total = Math.ceil(players.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = players.slice(start, end);

  return (
    <>
      <div id="rank_con1">
        <div class="card bg-base-100 shadow-xl" id="rank_rankvis">
          <div class="p-6">
            <h2 class="card-title">Displaying Top 10 Rankings</h2>
            <Chart data={ranking} height={235} width={1250} />
          </div>
          <div class="pl-6 pt-2 pr-6">
            <h2 class="card-title">Year-end Rankings</h2>
            <div class="table-md pt-1" id="rank_table-md">
              <table class="table">
                <thead>
                  <tr>
                    <th class="rank_th">Rank</th>
                    <th class="rank_th">Name</th>
                    <th class="rank_th">Country</th>
                    <th class="rank_th">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((player) => (
                    <tr class="hover:bg-base-300" key={player.rank}>
                      <td>{player.rank}</td>
                      <td>
                        {player.name_first} {player.name_last}
                      </td>
                      <td>{player.country}</td>
                      <td>{player.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div class="card-actions justify-end pt-2">
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
                className="btn btn-sm btn-primary"
                onClick={nextPage}
                disabled={end >= players.length}
              >
                next
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
