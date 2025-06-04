import "./players.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addfavorite, removefavorite } from "../redux/playerstore.jsx";

export default function players() {
  const [page, setPage] = useState(0);
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState({
    hand: [],
    ohbh: [],
    minage: 14,
    maxage: 45,
    ioc: [],
  });
  const [f_plist, setF_plist] = useState({
    hand: [],
    ohbh: [],
    minage: 14,
    maxage: 45,
    ioc: [],
  });
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(false);
  const [query, setQuery] = useState("");
  const [debounce, setDebounce] = useState("");
  const [pprofilelist, setPprofilelist] = useState([]);
  const entries = 6;
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.favorites);

  const favorited = (playerid) =>
    favorites.some((fav) => fav.playerid === playerid);
  const togglefavorite = (playerid, name, ioc) => {
    if (favorites.some((fav) => fav.playerid === playerid)) {
      dispatch(removefavorite(playerid));
    } else {
      dispatch(addfavorite({ playerid: playerid, name: name, ioc: ioc }));
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(query);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (debounce.trim() === "") {
        setPlayers([]);
        setPage(0);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/search_players",
          {
            params: { query: debounce },
          }
        );
        setPlayers(response.data);
        setPage(0);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    };

    fetchPlayers();
  }, [debounce]);

  useEffect(() => {
    const total = Math.ceil(players.length / entries);
    if (page >= total && total > 0) {
      setPage(total - 1);
    }
  }, [players, page, entries]);

  const pprofile_ver = async () => {
    try {
      const response = await axios.get("http://localhost:5000/pprofile");
      const ppid = response.data.map((player) => player.player_id); // Extract player IDs
      setPprofilelist(ppid);
    } catch (error) {
      console.error(`Error retrieving player profile: `, error);
    }
  };

  useEffect(() => {
    pprofile_ver();
  }, []);

  const fetchPlist = async (filters) => {
    const sent = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, value]) => value !== null && value.length !== 0
      )
    );
    try {
      const response = await axios.get("http://localhost:5000/list_players", {
        params: sent,
        paramsSerializer: (params) => {
          return Object.entries(params)
            .map(([key, value]) =>
              Array.isArray(value)
                ? value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&")
                : `${key}=${encodeURIComponent(value)}`
            )
            .join("&");
        },
      });
      setPlayers(response.data);
      setPage(0);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const search = (q) => {
    const searchquery = q.target.value;
    setQuery(searchquery);
  };

  const toggle = () => {
    setOpen(!open);
  };

  const setlist = () => {
    setList(!list);
    if (list) {
      {
        setQuery("");
        setFilter({
          hand: [],
          ohbh: [],
          age: null,
          ioc: [],
        });
        setPlayers([]);
      }
    } else {
      {
        setQuery("");
        setF_plist({
          hand: [],
          ohbh: [],
          minage: 14,
          maxage: 45,
          ioc: [],
        });
        setPlayers([]);
      }
    }
  };

  const s_result = players.filter((player) =>
    player.player_name.toLowerCase().includes(query.trim().toLowerCase())
  );

  const FilterChange = (select) => (f) => {
    const { value } = f.target;

    setFilter((prev) => ({
      ...prev,
      [select]: prev[select].includes(value)
        ? prev[select].filter((item) => item !== value)
        : [...prev[select], value],
    }));

    setPage(0);
  };

  const ListChange = (select) => (f) => {
    const { value } = f.target;

    const plist = {
      ...f_plist,
      [select]: f_plist[select].includes(value)
        ? f_plist[select].filter((item) => item !== value)
        : [...f_plist[select], value],
    };

    setF_plist(plist);
    fetchPlist(plist);
  };

  const player_filter = s_result.filter((player) => {
    const p_hand =
      filter.hand.length === 0 || filter.hand.includes(player.hand);

    const p_ohbh =
      filter.ohbh.length === 0 || filter.ohbh.includes(String(player.ohbh));

    const age_2023 =
      new Date("2023-12-31").getFullYear() - new Date(player.dob).getFullYear();
    const p_minage = filter.minage === null || age_2023 >= filter.minage;
    const p_maxage = filter.maxage === null || age_2023 <= filter.maxage;

    const p_country =
      filter.ioc.length === 0 ||
      filter.ioc.some((ioc) =>
        player.country.toLowerCase().includes(ioc.toLowerCase())
      );

    return p_hand && p_ohbh && p_minage && p_maxage && p_country;
  });

  const total = Math.ceil(player_filter.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = player_filter.slice(start, end);

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

  if (page >= total && total > 0) {
    setPage(total - 1);
  }

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

  return (
    <>
      <div id="player_con1">
        <div class="card bg-base-100 shadow-xl" id="player_dis">
          <div class="card-body">
            <div class="head">
              <h1 class="card-title">Player List</h1>
              <label class="flex cursor-pointer gap-2 switch">
                <span class="label-text">Search</span>
                <input
                  type="checkbox"
                  value={list}
                  onChange={setlist}
                  class="toggle toggle-neutral"
                />
                <span class="label-text">List</span>
              </label>
            </div>
            <div class={`player_option ${list ? "" : "open"}`}>
              <div class="searchs">
                <label class="input input-neutral" id="searchbar">
                  <input
                    type="search"
                    required
                    placeholder="Search player..."
                    value={query}
                    onChange={search}
                  />
                </label>
                <button
                  class="btn btn-sm btn-primary"
                  id="filter_btn"
                  onClick={toggle}
                >
                  {open ? "△" : "▽"}
                </button>
                <button
                  class="btn btn-sm btn-primary"
                  id="reset_btn"
                  onClick={() => {
                    setFilter({
                      hand: [],
                      ohbh: [],
                      minage: 14,
                      maxage: 45,
                      ioc: [],
                    });
                    setQuery("");
                    setPage(0);
                  }}
                >
                  Reset
                </button>
              </div>
              <div class={`bg-base-300 filterdiv ${open ? "open" : ""}`}>
                <div class="foption">
                  <label class="option_head">Hand:</label>
                  {["L", "R"].map((hand) => (
                    <label class="option_format" key={hand}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={hand}
                        checked={filter.hand.includes(hand)}
                        onChange={FilterChange("hand")}
                      />
                      {hand === "L" ? "Left" : "Right"}
                    </label>
                  ))}
                </div>
                <div class="foption">
                  <label class="option_head"> Backhand:</label>
                  {[true, false].map((ohbh) => (
                    <label class="option_format" key={ohbh}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={ohbh}
                        checked={filter.ohbh.includes(String(ohbh))}
                        onChange={FilterChange("ohbh")}
                      />
                      {ohbh ? "One" : "Two"}-handed
                    </label>
                  ))}
                </div>
                <div class="foption">
                  <label class="option_head">Nationality:</label>
                  <input
                    class="input input-primary input-xs"
                    type="text"
                    placeholder="Enter nationality"
                    value={filter.ioc.join(", ")}
                    onChange={(f) =>
                      setFilter({
                        ...filter,
                        ioc: [f.target.value],
                      })
                    }
                    onBlur={(f) =>
                      setFilter({
                        ...filter,
                        ioc: f.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter((item) => item !== ""),
                      })
                    }
                  />
                </div>
                <div class="foption">
                  <label class="option_head">
                    minAge: {filter.minage ?? "Any"}
                    <input
                      class="range range-xs option_slider range-neutral"
                      type="range"
                      min="14"
                      max="45"
                      value={filter.minage ?? 0}
                      step="1"
                      onChange={(f) =>
                        setFilter({
                          ...filter,
                          minage:
                            f.target.value === "0"
                              ? null
                              : parseInt(f.target.value, 10),
                        })
                      }
                    />
                  </label>
                </div>
                <div class="foption">
                  <label class="option_head">
                    maxAge: {filter.maxage ?? "Any"}
                    <input
                      class="range range-xs option_slider range-neutral"
                      type="range"
                      min="14"
                      max="45"
                      value={filter.maxage ?? 0}
                      step="1"
                      onChange={(f) =>
                        setFilter({
                          ...filter,
                          maxage:
                            f.target.value === "0"
                              ? null
                              : parseInt(f.target.value, 10),
                        })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class={`player_option ${list ? "open" : ""}`}>
              <div class={`listopt`}>
                <div class="loption">
                  <label class="option_head_l">Hand:</label>
                  {["L", "R"].map((hand) => (
                    <label class="option_format_l" key={hand}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={hand}
                        checked={f_plist.hand.includes(hand)}
                        onChange={ListChange("hand")}
                      />
                      {hand === "L" ? "Left" : "Right"}
                    </label>
                  ))}
                </div>
                <div class="loption">
                  <label class="option_head_l"> Backhand:</label>
                  {[true, false].map((ohbh) => (
                    <label class="option_format_l" key={ohbh}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={ohbh}
                        checked={f_plist.ohbh.includes(String(ohbh))}
                        onChange={ListChange("ohbh")}
                      />
                      {ohbh ? "One" : "Two"}-handed
                    </label>
                  ))}
                </div>
                <div class="loption">
                  <label class="option_head_l_n">Nationality:</label>
                  <input
                    class="input input-primary input-xs nation_l"
                    type="text"
                    placeholder="Enter nationality"
                    value={f_plist.ioc.join(", ")}
                    onChange={(f) => {
                      const updated = [f.target.value];
                      setF_plist((prev) => ({
                        ...prev,
                        ioc: updated,
                      }));
                    }}
                    onBlur={(f) => {
                      const updated = f.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter((item) => item !== "");
                      setF_plist((prev) => ({
                        ...prev,
                        ioc: updated,
                      }));
                      fetchPlist({
                        ...f_plist,
                        ioc: updated,
                      });
                    }}
                  />
                </div>
                <div class="loption">
                  <label class="option_head_l">
                    minage: {f_plist.minage ?? "Any"}
                    <input
                      class="range range-xs option_slider range-neutral"
                      type="range"
                      min="14"
                      max="45"
                      value={f_plist.minage ?? 0}
                      step="1"
                      onChange={(f) => {
                        const min = parseInt(f.target.value, 10);
                        setF_plist((prev) => ({
                          ...prev,
                          minage: min,
                        }));
                        fetchPlist({
                          ...f_plist,
                          minage: min,
                        });
                      }}
                    />
                  </label>
                </div>
                <div class="loption">
                  <label class="option_head_l">
                    maxage: {f_plist.maxage ?? "Any"}
                    <input
                      class="range range-xs option_slider range-neutral"
                      type="range"
                      min="14"
                      max="45"
                      value={f_plist.maxage ?? 0}
                      step="1"
                      onChange={(f) => {
                        const max = parseInt(f.target.value, 10);
                        setF_plist((prev) => ({
                          ...prev,
                          maxage: max,
                        }));
                        fetchPlist({
                          ...f_plist,
                          maxage: max,
                        });
                      }}
                    />
                  </label>
                </div>
                <button
                  class="btn btn-sm btn-primary"
                  id="lreset_btn"
                  onClick={() => {
                    setF_plist({
                      hand: [],
                      ohbh: [],
                      minage: 14,
                      maxage: 45,
                      ioc: [],
                    });
                    setPlayers([]);
                    setPage(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div
              id="player_result"
              class={players.length === 0 ? "center" : ""}
            >
              {list ? (
                //list
                <>
                  {players.length > 0 ? (
                    display.map((player) => (
                      <div
                        class="card-body bg-base-200 shadow-sm search_card_p"
                        key={player.player_id}
                      >
                        {pprofilelist.some((id) => id === player.player_id) ? (
                          <Link to={`/players/${player.player_id}`}>
                            <strong class="pname_link">
                              {player.player_name}
                            </strong>
                          </Link>
                        ) : (
                          <strong class="pname">{player.player_name}</strong>
                        )}
                        <p>{player.country}</p>
                        <p>
                          {format_h(player.hand)}
                          {format_b(player.ohbh)}
                        </p>
                        <p>
                          {format_d(player.dob)}
                          {format_age(player.dob)}
                        </p>
                        <p>
                          {player.height !== null && format_he(player.height)}
                        </p>
                        {pprofilelist.some((id) => id === player.player_id) ? (
                          <button
                            class={`btn btn-sm ${
                              favorited(player.player_id)
                                ? "btn-error"
                                : "btn-neutral"
                            }`}
                            onClick={() =>
                              togglefavorite(
                                player.player_id,
                                player.player_name,
                                player.ioc
                              )
                            }
                          >
                            {favorited(player.player_id)
                              ? "Unfavorite"
                              : "Favorite"}
                          </button>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div class="message">
                      <p>No players found ._.</p>
                    </div>
                  )}
                </>
              ) : (
                //search
                <>
                  {query.trim() === "" ? (
                    <div class="message">
                      <p>Search for player...</p>
                    </div>
                  ) : players.length > 0 ? (
                    display.map((player) => (
                      <div
                        class="card-body bg-base-200 shadow-sm search_card_p"
                        key={player.player_id}
                      >
                        {pprofilelist.some((id) => id === player.player_id) ? (
                          <Link to={`/players/${player.player_id}`}>
                            <strong class="pname_link">
                              {player.player_name}
                            </strong>
                          </Link>
                        ) : (
                          <strong class="pname">{player.player_name}</strong>
                        )}
                        <p>{player.country}</p>
                        <p>
                          {format_h(player.hand)}
                          {format_b(player.ohbh)}
                        </p>
                        <p>
                          {format_d(player.dob)}
                          {format_age(player.dob)}
                        </p>
                        <p>
                          {player.height !== null && format_he(player.height)}
                        </p>
                        {pprofilelist.some((id) => id === player.player_id) ? (
                          <button
                            class={`btn btn-sm ${
                              favorited(player.player_id)
                                ? "btn-error"
                                : "btn-neutral"
                            }`}
                            onClick={() =>
                              togglefavorite(
                                player.player_id,
                                player.player_name,
                                player.ioc
                              )
                            }
                          >
                            {favorited(player.player_id)
                              ? "Unfavorite"
                              : "Favorite"}
                          </button>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <div class="message">
                      <p>No players found ._.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div class="card-actions justify-end">
              {players.length > 0 && (
                <>
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
                    disabled={end >= players.length}
                  >
                    next
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
