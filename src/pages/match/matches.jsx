import { round } from "@amcharts/amcharts5/.internal/core/util/Time";
import "./matches.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function matches() {
  const [page, setPage] = useState(0);
  const [matches, setMatches] = useState([]);
  const [filter, setFilter] = useState({
    month: null,
    category: [],
    surface: [],
    round: [],
    hand: [],
    ohbh: [],
    ioc: [],
    status: "all",
    upset: false,
  });
  const [f_plist, setF_plist] = useState({
    month: null,
    category: [],
    surface: [],
    round: [],
    hand_1: [],
    ohbh_1: [],
    ioc_1: [],
    hand_2: [],
    ohbh_2: [],
    ioc_2: [],
    status: "all",
    upset: false,
  });
  const [open, setOpen] = useState(false);
  const [list, setList] = useState(false);
  const [query, setQuery] = useState("");
  const [debounce, setDebounce] = useState("");

  const entries = 6;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounce(query);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (debounce.trim() === "") {
        setMatches([]);
        setPage(0);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/search_matches",
          {
            params: { query: debounce },
          }
        );
        setMatches(response.data);
        setPage(0);
      } catch (error) {
        console.error("Error fetching matches:", error);
      }
    };

    fetchMatches();
  }, [debounce]);

  useEffect(() => {
    const total = Math.ceil(matches.length / entries);
    if (page >= total && total > 0) {
      setPage(total - 1);
    }
  }, [matches, page, entries]);

  const fetchPlist = async (filters) => {
    const sent = Object.fromEntries(
      Object.entries(filters).filter(
        ([key, value]) =>
          key !== "status" &&
          key !== "upset" &&
          value !== null &&
          value.length !== 0
      )
    );
    try {
      const response = await axios.get("http://localhost:5000/list_matches", {
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
      setMatches(response.data);
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
          month: null,
          category: [],
          round: [],
          surface: [],
          hand: [],
          ohbh: [],
          ioc: [],
          status: "all",
          upset: false,
        });
        setMatches([]);
      }
    } else {
      {
        setQuery("");
        setF_plist({
          month: null,
          category: [],
          round: [],
          surface: [],
          hand_1: [],
          ohbh_1: [],
          ioc_1: [],
          hand_2: [],
          ohbh_2: [],
          ioc_2: [],
          status: "all",
          upset: false,
        });
        setMatches([]);
      }
    }
  };

  const FilterChange = (select) => (f) => {
    const value = String(f.target.value);

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
      [select]:
        select === "month"
          ? value === ""
            ? null
            : parseInt(value, 10)
          : f_plist[select]?.includes(value)
          ? f_plist[select].filter((item) => item !== value)
          : [...(f_plist[select] || []), value],
    };

    setF_plist(plist);
    fetchPlist(plist);
  };

  const player_filter = matches.filter((match) => {
    const t_category =
      filter.category.length === 0 ||
      filter.category.includes(String(match.category));
    const t_surface =
      filter.surface.length === 0 || filter.surface.includes(match.surface);
    const t_round =
      filter.round.length === 0 || filter.round.includes(match.round);
    const t_month =
      filter.month === null ||
      new Date(match.tourney_date).getMonth() === filter.month;
    const p_hand =
      filter.hand.length === 0 ||
      filter.hand.includes(match.winner_hand) ||
      filter.hand.includes(match.loser_hand);

    const p_ohbh =
      filter.ohbh.length === 0 ||
      filter.ohbh.includes(String(match.winner_ohbh)) ||
      filter.ohbh.includes(String(match.loser_ohbh));

    const p_country =
      filter.ioc.length === 0 ||
      filter.ioc.some(
        (ioc) =>
          match.winner_country.toLowerCase().includes(ioc.toLowerCase()) ||
          match.loser_country.toLowerCase().includes(ioc.toLowerCase())
      );

    const p_status =
      filter.status === "all" ||
      (filter.status === "completed" &&
        !match.score.includes("RET") &&
        !match.score.includes("W/O")) ||
      (filter.status === "incomplete" &&
        (match.score.includes("RET") || match.score.includes("W/O")));

    const p_upset = !filter.upset || match.winner_rank - match.loser_rank >= 20;

    const pf_status =
      f_plist.status === "all" ||
      (f_plist.status === "completed" &&
        !match.score.includes("RET") &&
        !match.score.includes("W/O")) ||
      (f_plist.status === "incomplete" &&
        (match.score.includes("RET") || match.score.includes("W/O")));

    const pf_upset =
      !f_plist.upset || match.winner_rank - match.loser_rank >= 20;

    return (
      t_category &&
      t_surface &&
      t_round &&
      t_month &&
      p_hand &&
      p_ohbh &&
      p_country &&
      p_status &&
      p_upset &&
      pf_status &&
      pf_upset
    );
  });

  const total = Math.ceil(player_filter.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = player_filter.slice(start, end);

  const nextPage = () => {
    if ((page + 1) * entries < matches.length) {
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

  return (
    <>
      <div id="player_con1">
        <div class="card bg-base-100 shadow-xl" id="player_dis">
          <div class="card-body">
            <div class="head">
              <h1 class="card-title">Match List</h1>
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
                      month: null,
                      category: [],
                      round: [],
                      surface: [],
                      hand: [],
                      ohbh: [],
                      ioc: [],
                      status: "all",
                      upset: false,
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
                  <label class="option_head">Month:</label>
                  <select
                    id="month_select"
                    class="select select-primary select-xs"
                    value={filter.month ?? ""}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        month:
                          e.target.value === ""
                            ? null
                            : parseInt(e.target.value, 10),
                      })
                    }
                  >
                    <option
                      value=""
                      style={{
                        fontSize: "14px",
                      }}
                    >
                      Select Month...
                    </option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option
                        key={i}
                        value={i}
                        style={{
                          fontSize: "14px",
                        }}
                      >
                        {new Date(0, i).toLocaleString("en", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </div>
                <div class="foption">
                  <label class="option_head"> Category:</label>
                  {[2000, 1500, 1000, 500, 250].map((category) => (
                    <label class="option_format" key={category}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={String(category)}
                        checked={filter.category.includes(String(category))}
                        onChange={FilterChange("category")}
                      />
                      {category}
                    </label>
                  ))}
                </div>
                <div class="foption">
                  <label class="option_head"> Surface:</label>
                  {["Hard", "Clay", "Grass"].map((surface) => (
                    <label class="option_format" key={surface}>
                      <input
                        class="checkbox checkbox-sm cb_format"
                        type="checkbox"
                        value={surface}
                        checked={filter.surface.includes(surface)}
                        onChange={FilterChange("surface")}
                      />
                      {surface}
                    </label>
                  ))}
                </div>
                <div class="foption">
                  <label class="option_head"> Round:</label>
                  {["F", "SF", "QF", "R16", "R32", "R64", "R128", "RR"].map(
                    (round) => (
                      <label class="option_format" key={round}>
                        <input
                          class="checkbox checkbox-sm cb_format"
                          type="checkbox"
                          value={round}
                          checked={filter.round.includes(round)}
                          onChange={FilterChange("round")}
                        />
                        {round}
                      </label>
                    )
                  )}
                </div>
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
                  <label class="option_head">Match Status:</label>
                  {["all", "completed", "incomplete"].map((status) => (
                    <label class="option_format" key={status}>
                      <input
                        class="radio radio-sm radio-neutral bg-base-300 cb_format"
                        type="radio"
                        value={status}
                        checked={filter.status === status}
                        onChange={(e) =>
                          setFilter((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                      />
                      {status.charAt(0).toUpperCase() + status.slice(1)} Matches
                    </label>
                  ))}
                </div>
                <div class="foption">
                  <label class="option_head">Match Upset:</label>
                  <label class="option_format">
                    <input
                      class="checkbox checkbox-sm cb_format"
                      type="checkbox"
                      checked={filter.upset}
                      onChange={(e) =>
                        setFilter((prev) => ({
                          ...prev,
                          upset: e.target.checked,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
            <div class={`player_option ${list ? "open" : ""}`}>
              <div class={`listopt`}>
                <div class="dropdown">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn m-1 pt-3 tooltip tooltip-bottom"
                    data-tip="Set me first"
                  >
                    Winner Properties
                  </div>
                  <div
                    tabindex="0"
                    class="dropdown-content card card-sm bg-base-200 z-1 w-64 shadow-md"
                  >
                    <div class="card-body">
                      <div class="loption">
                        <label class="option_head_l">Hand (Winner):</label>
                        {["L", "R"].map((hand_1) => (
                          <label class="option_format_l" key={hand_1}>
                            <input
                              class="checkbox checkbox-sm cb_format"
                              type="checkbox"
                              value={hand_1}
                              checked={f_plist.hand_1.includes(hand_1)}
                              onChange={ListChange("hand_1")}
                            />
                            {hand_1 === "L" ? "Left" : "Right"}
                          </label>
                        ))}
                      </div>
                      <div class="loption">
                        <label class="option_head_l"> Backhand (Winner):</label>
                        {[true, false].map((ohbh_1) => (
                          <label class="option_format_l" key={ohbh_1}>
                            <input
                              class="checkbox checkbox-sm cb_format"
                              type="checkbox"
                              value={ohbh_1}
                              checked={f_plist.ohbh_1.includes(String(ohbh_1))}
                              onChange={ListChange("ohbh_1")}
                            />
                            {ohbh_1 ? "One" : "Two"}-handed
                          </label>
                        ))}
                      </div>
                      <div class="loption">
                        <label class="option_head_l_n">
                          Nationality (Winner):
                        </label>
                        <input
                          class="input input-primary input-xs nation_l"
                          type="text"
                          placeholder="Enter nationality"
                          value={f_plist.ioc_1.join(", ")}
                          onChange={(f) => {
                            const updated = [f.target.value];
                            setF_plist((prev) => ({
                              ...prev,
                              ioc_1: updated,
                            }));
                          }}
                          onBlur={(f) => {
                            const updated = f.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter((item) => item !== "");
                            setF_plist((prev) => ({
                              ...prev,
                              ioc_1: updated,
                            }));
                            fetchPlist({
                              ...f_plist,
                              ioc_1: updated,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dropdown">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn m-1 pt-3 tooltip tooltip-bottom"
                    data-tip="Set me first"
                  >
                    Loser Properties
                  </div>
                  <div
                    tabindex="0"
                    class="dropdown-content card card-sm bg-base-200 z-1 w-64 shadow-md"
                  >
                    <div class="card-body">
                      <div class="loption">
                        <label class="option_head_l">Hand (Loser):</label>
                        {["L", "R"].map((hand_2) => (
                          <label class="option_format_l" key={hand_2}>
                            <input
                              class="checkbox checkbox-sm cb_format"
                              type="checkbox"
                              value={hand_2}
                              checked={f_plist.hand_2.includes(hand_2)}
                              onChange={ListChange("hand_2")}
                            />
                            {hand_2 === "L" ? "Left" : "Right"}
                          </label>
                        ))}
                      </div>
                      <div class="loption">
                        <label class="option_head_l"> Backhand (Loser):</label>
                        {[true, false].map((ohbh_2) => (
                          <label class="option_format_l" key={ohbh_2}>
                            <input
                              class="checkbox checkbox-sm cb_format"
                              type="checkbox"
                              value={ohbh_2}
                              checked={f_plist.ohbh_2.includes(String(ohbh_2))}
                              onChange={ListChange("ohbh_2")}
                            />
                            {ohbh_2 ? "One" : "Two"}-handed
                          </label>
                        ))}
                      </div>
                      <div class="loption">
                        <label class="option_head_l_n">
                          Nationality (Loser):
                        </label>
                        <input
                          class="input input-primary input-xs nation_l"
                          type="text"
                          placeholder="Enter nationality"
                          value={f_plist.ioc_2.join(", ")}
                          onChange={(f) => {
                            const updated = [f.target.value];
                            setF_plist((prev) => ({
                              ...prev,
                              ioc_2: updated,
                            }));
                          }}
                          onBlur={(f) => {
                            const updated = f.target.value
                              .split(",")
                              .map((item) => item.trim())
                              .filter((item) => item !== "");
                            setF_plist((prev) => ({
                              ...prev,
                              ioc_2: updated,
                            }));
                            fetchPlist({
                              ...f_plist,
                              ioc_2: updated,
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="dropdown">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn m-1 pt-3 tooltip tooltip-bottom"
                    data-tip="Set me first"
                  >
                    Tournament Properties
                  </div>
                  <div
                    tabindex="0"
                    class="dropdown-content card card-sm bg-base-200 z-1 w-100 h-55 p-4 shadow-md"
                  >
                    <div class="loption">
                      <label class="option_head">Month:</label>
                      <select
                        id="month_select"
                        class="select select-primary select-xs"
                        value={f_plist.month ?? ""}
                        onChange={ListChange("month")}
                      >
                        <option
                          value=""
                          style={{
                            fontSize: "14px",
                          }}
                        >
                          Select Month...
                        </option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option
                            key={i}
                            value={i + 1}
                            style={{
                              fontSize: "14px",
                            }}
                          >
                            {new Date(0, i).toLocaleString("en", {
                              month: "long",
                            })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div class="loption">
                      <label class="option_head"> Category:</label>
                      {[2000, 1500, 1000, 500, 250].map((category) => (
                        <label class="option_format" key={category}>
                          <input
                            class="checkbox checkbox-sm cb_format"
                            type="checkbox"
                            value={String(category)}
                            checked={f_plist.category.includes(
                              String(category)
                            )}
                            onChange={ListChange("category")}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                    <div class="loption">
                      <label class="option_head"> Surface:</label>
                      {["Hard", "Clay", "Grass"].map((surface) => (
                        <label class="option_format" key={surface}>
                          <input
                            class="checkbox checkbox-sm cb_format"
                            type="checkbox"
                            value={surface}
                            checked={f_plist.surface.includes(surface)}
                            onChange={ListChange("surface")}
                          />
                          {surface}
                        </label>
                      ))}
                    </div>
                    <div class="loption">
                      <label class="option_head"> Round:</label>
                      {["F", "SF", "QF", "R16", "R32", "R64", "R128", "RR"].map(
                        (round) => (
                          <label class="option_format" key={round}>
                            <input
                              class="checkbox checkbox-sm cb_format"
                              type="checkbox"
                              value={round}
                              checked={f_plist.round.includes(round)}
                              onChange={ListChange("round")}
                            />
                            {round}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div class="dropdown">
                  <div
                    tabindex="0"
                    role="button"
                    class="btn m-1 pt-3 tooltip tooltip-bottom"
                    data-tip="Set Properties first"
                  >
                    Match Filter
                  </div>
                  <div
                    tabindex="0"
                    class="dropdown-content card card-sm bg-base-200 z-1 w-100 h-30 p-4 shadow-md"
                  >
                    <div class="loption">
                      <label class="option_head">Match Status:</label>
                      {["all", "completed", "incomplete"].map((status) => (
                        <label class="option_format" key={status}>
                          <input
                            class="radio radio-sm radio-neutral bg-base-200 cb_format"
                            type="radio"
                            value={status}
                            checked={f_plist.status === status}
                            onChange={(e) =>
                              setF_plist((prev) => ({
                                ...prev,
                                status: e.target.value,
                              }))
                            }
                          />
                          {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                          Matches
                        </label>
                      ))}
                    </div>
                    <div class="loption">
                      <label class="option_head">Match Upset:</label>
                      <label class="option_format">
                        <input
                          class="checkbox checkbox-sm cb_format"
                          type="checkbox"
                          checked={f_plist.upset}
                          onChange={(e) =>
                            setF_plist((prev) => ({
                              ...prev,
                              upset: e.target.checked,
                            }))
                          }
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-sm btn-primary"
                  id="lreset_btn"
                  onClick={() => {
                    setF_plist({
                      month: null,
                      category: [],
                      round: [],
                      surface: [],
                      hand_1: [],
                      ohbh_1: [],
                      ioc_1: [],
                      hand_2: [],
                      ohbh_2: [],
                      ioc_2: [],
                      status: "all",
                      upset: false,
                    });
                    setMatches([]);
                    setPage(0);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div
              id="player_result"
              class={matches.length === 0 ? "center" : ""}
            >
              {list ? (
                //list
                <>
                  {matches.length > 0 ? (
                    display.map((matches) => (
                      <div
                        class="card-body bg-base-200 shadow-sm search_card"
                        key={matches.match_id}
                      >
                        <Link to={`/matches/${matches.match_id}`}>
                          <strong
                            class="pname_link"
                            style={{
                              color:
                                matches.round === "F" ? "#9c8700" : "#2e8602",
                            }}
                          >
                            {matches.tourney_name} {matches.round}:{" "}
                            {matches.winner_name} VS {matches.loser_name}
                          </strong>
                        </Link>
                        <p>{matches.surface}</p>
                        <p>
                          {format_n(
                            matches.winner_name,
                            matches.winner_entry,
                            matches.winner_seed
                          )}{" "}
                          ({matches.winner_ioc}) d.{" "}
                          {format_nn(
                            matches.loser_name,
                            matches.loser_entry,
                            matches.loser_seed
                          )}{" "}
                          ({matches.loser_ioc}) {matches.score}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div class="message">
                      <p>No matches found ._.</p>
                    </div>
                  )}
                </>
              ) : (
                //search
                <>
                  {query.trim() === "" ? (
                    <div class="message">
                      <p>Search for match...</p>
                    </div>
                  ) : matches.length > 0 ? (
                    display.map((matches) => (
                      <div
                        class="card-body bg-base-200 shadow-sm search_card"
                        key={matches.match_id}
                      >
                        <Link to={`/matches/${matches.match_id}`}>
                          <strong
                            class="pname_link"
                            style={{
                              color:
                                matches.round === "F" ? "#9c8700" : "#2e8602",
                            }}
                          >
                            {matches.tourney_name} {matches.round}:{" "}
                            {matches.winner_name} VS {matches.loser_name}
                          </strong>
                        </Link>
                        <p>{matches.surface}</p>
                        <p>
                          {format_n(
                            matches.winner_name,
                            matches.winner_entry,
                            matches.winner_seed
                          )}{" "}
                          ({matches.winner_ioc}) d.{" "}
                          {format_nn(
                            matches.loser_name,
                            matches.loser_entry,
                            matches.loser_seed
                          )}{" "}
                          ({matches.loser_ioc}) {matches.score}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div class="message">
                      <p>No matches found ._.</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <div class="card-actions justify-end">
              {player_filter.length > 0 && (
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
                    disabled={end >= player_filter.length}
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
