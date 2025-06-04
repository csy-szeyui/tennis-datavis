import "./tourney.css";
import Fuse from "fuse.js";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function tourney() {
  const [page, setPage] = useState(0);
  const [tourney, setTourney] = useState([]);
  const [filter, setFilter] = useState({
    category: [],
    surface: [],
    month: null,
    minspeed: 0.4,
    maxspeed: 1.8,
  });
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [query, setQuery] = useState("");
  const entries = 9;

  useEffect(() => {
    const fetchTourney = async () => {
      try {
        const response2 = await axios.get("http://localhost:5000/tourney");
        setTourney(response2.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchTourney();
  }, []);

  const FilterChange = (select) => (f) => {
    const { value } = f.target;
    const parsed = select === "category" ? parseInt(value, 10) : value;

    setFilter((prev) => ({
      ...prev,
      [select]: prev[select].includes(parsed)
        ? prev[select].filter((item) => item !== parsed)
        : [...prev[select], parsed],
    }));

    setPage(0);
  };

  const fuse = new Fuse(tourney, {
    keys: ["name", "champion_2023"],
    includeScore: true,
    threshold: 0.3,
  });

  const filter_query = query
    ? fuse.search(query).map((result) => result.item)
    : tourney;

  const tourney_filter = filter_query.filter((tour) => {
    const t_category =
      filter.category.length === 0 || filter.category.includes(tour.category);
    const t_surface =
      filter.surface.length === 0 || filter.surface.includes(tour.surface);
    const t_month =
      filter.month === null || new Date(tour.week).getMonth() === filter.month;
    const t_speed =
      tour.speed >= filter.minspeed && tour.speed <= filter.maxspeed;

    return t_category && t_surface && t_month && t_speed;
  });

  const sorting = (key) => {
    setSort((prev) => {
      const direction =
        prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction };
    });
    setPage(0);
  };

  const tourney_sort = tourney_filter.sort((a, b) => {
    if (!sort.key) return 0;

    let a_tour = a[sort.key];
    let b_tour = b[sort.key];

    if (sort.key === "week") {
      a_tour = new Date(a.week);
      b_tour = new Date(b.week);
    }

    if (a_tour < b_tour) return sort.direction === "asc" ? -1 : 1;
    if (a_tour > b_tour) return sort.direction === "asc" ? 1 : -1;
    return 0;
  });

  const toggle = () => {
    setOpen(!open);
  };

  const nextPage = () => {
    if ((page + 1) * entries < tourney_filter.length) {
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

  const total = Math.ceil(tourney_filter.length / entries);
  const start = page * entries;
  const end = start + entries;
  const display = tourney_sort.slice(start, end);

  const format = (date_s) => {
    const date = new Date(date_s);
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString("en-GB", options);
  };

  return (
    <>
      <div id="tourney_con1">
        <div class="card bg-base-100 shadow-xl" id="tourney_dis">
          <div class="card-body">
            <h1 class="card-title">2023 ATP Tour</h1>
            <div class="searchs">
              <label class="input input-neutral" id="searchbar">
                <input
                  type="search"
                  required
                  placeholder="Search"
                  value={query}
                  onChange={(q) => {
                    setQuery(q.target.value);
                    setPage(0);
                  }}
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
                    category: [],
                    surface: [],
                    month: null,
                    minspeed: 0.4,
                    maxspeed: 1.8,
                  });
                  setSort({ key: null, direction: "asc" });
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
                      value={category}
                      checked={filter.category.includes(category)}
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
                <label class="option_head">
                  Min. Speed: {filter.minspeed}
                  <input
                    class="range range-xs option_slider range-neutral"
                    type="range"
                    min="0.4"
                    max="1.8"
                    value={filter.minspeed}
                    step="0.2"
                    onChange={(f) =>
                      setFilter({
                        ...filter,
                        minspeed: parseFloat(f.target.value),
                      })
                    }
                  />
                </label>
                <label class="option_head">
                  Max. Speed: {filter.maxspeed}
                  <input
                    class="range range-xs option_slider range-neutral"
                    type="range"
                    min="0.4"
                    max="1.8"
                    value={filter.maxspeed}
                    step="0.2"
                    onChange={(f) =>
                      setFilter({
                        ...filter,
                        maxspeed: parseFloat(f.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>
            <div class="table-md" id="tourney_table-md">
              <table class="table">
                <thead>
                  <tr>
                    <th class="tourney_th" onClick={() => sorting("week")}>
                      Date
                    </th>
                    <th class="tourney_th" onClick={() => sorting("category")}>
                      Category
                    </th>
                    <th class="tourney_th" onClick={() => sorting("name")}>
                      Name
                    </th>
                    <th class="tourney_th" onClick={() => sorting("surface")}>
                      Surface
                    </th>
                    <th class="tourney_th" onClick={() => sorting("speed")}>
                      Speed
                    </th>
                    <th class="tourney_th_dis">Champion</th>
                  </tr>
                </thead>
                <tbody>
                  {display.map((tourney) => (
                    <tr class="hover:bg-base-300" key={tourney.name}>
                      <td>{format(tourney.week)}</td>
                      <td>{tourney.category}</td>
                      <td
                        class="tooltip tooltip-right"
                        data-tip={tourney.sponsored_name}
                      >
                        {tourney.name}
                      </td>
                      <td>{tourney.surface}</td>
                      <td>{tourney.speed}</td>
                      <td
                        class="tooltip tooltip-right"
                        data-tip={tourney.country}
                      >
                        {tourney.winner ? (
                          <Link to={`/players/${tourney.winner}`}>
                            {tourney.champion_2023}
                          </Link>
                        ) : (
                          tourney.champion_2023
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div class="card-actions justify-end">
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
                disabled={end >= tourney.length}
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
