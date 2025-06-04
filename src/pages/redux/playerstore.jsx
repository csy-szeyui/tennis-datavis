const add_favorite = "add_favorite";
const remove_favorite = "remove_favorite";
const clear_favorites = "clear_favorites";
const update_playerids = "update_playerids";

export const addfavorite = (player) => (dispatch, getState) => {
  dispatch({ type: add_favorite, payload: player });
  const { favorites } = getState();
  localStorage.setItem("favorites", JSON.stringify(favorites.favorites));
};

export const removefavorite = (playerid) => (dispatch, getState) => {
  dispatch({ type: remove_favorite, payload: playerid });
  const { favorites } = getState();
  localStorage.setItem("favorites", JSON.stringify(favorites.favorites));
};

export const clearfavorites = () => (dispatch) => {
  dispatch({ type: clear_favorites });
  localStorage.setItem("favorites", JSON.stringify([]));
};

export const updatematrix = (new_matrix) => (dispatch, getState) => {
  dispatch({ type: "update_reco", payload: new_matrix });
  const { reco } = getState();
  localStorage.setItem("matrix", JSON.stringify(reco.matrix));
};

export const update_reco = (players) => (dispatch, getState) => {
  const state = getState();
  const reco = {
    age: { ...state.reco.matrix.age },
    dominant: { ...state.reco.matrix.dominant },
    backhand: { ...state.reco.matrix.backhand },
    surface: { ...state.reco.matrix.surface },
  };
  const player_ids = [...state.reco.player_ids];

  players.forEach((player) => {
    const [playerid, age, hand, bh, sur] = player;

    if (age < 21) reco.age["15-20"]++;
    else if (age <= 25) reco.age["21-25"]++;
    else if (age <= 30) reco.age["26-30"]++;
    else if (age <= 35) reco.age["31-35"]++;
    else reco.age["36-40"]++;

    reco.dominant[hand]++;
    reco.backhand[bh]++;
    reco.surface[sur]++;

    if (!player_ids.includes(playerid)) {
      player_ids.push(playerid);
    }
  });
  localStorage.setItem("matrix", JSON.stringify(reco));
  localStorage.setItem("player_ids", JSON.stringify(player_ids));

  dispatch(updatematrix(reco));
  dispatch({ type: "update_playerids", payload: player_ids });
};

const initial = {
  favorites:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("favorites")) || []
      : [],
  matrix:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("matrix")) || {
          age: { "15-20": 0, "21-25": 0, "26-30": 0, "31-35": 0, "36-40": 0 },
          dominant: { R: 0, L: 0 },
          backhand: { ohbh: 0, thbh: 0 },
          surface: { Clay: 0, Hard: 0, Grass: 0 },
        }
      : {
          age: { "15-20": 0, "21-25": 0, "26-30": 0, "31-35": 0, "36-40": 0 },
          dominant: { R: 0, L: 0 },
          backhand: { ohbh: 0, thbh: 0 },
          surface: { Clay: 0, Hard: 0, Grass: 0 },
        },
  player_ids:
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("player_ids")) || []
      : [],
};

export const reset_matrix = () => (dispatch) => {
  const reset = {
    age: { "15-20": 0, "21-25": 0, "26-30": 0, "31-35": 0, "36-40": 0 },
    dominant: { R: 0, L: 0 },
    backhand: { ohbh: 0, thbh: 0 },
    surface: { Clay: 0, Hard: 0, Grass: 0 },
  };

  localStorage.setItem("matrix", JSON.stringify(reset));
  localStorage.setItem("player_ids", JSON.stringify([]));

  dispatch({ type: "reset_matrix_list", payload: reset });
};

const favorites_reducer = (state = initial, action) => {
  switch (action.type) {
    case add_favorite:
      const exists = state.favorites.some(
        (fav) => fav.playerid === action.payload.playerid
      );
      if (exists) return state;
      return { ...state, favorites: [...state.favorites, action.payload] };

    case remove_favorite:
      const update_remove = state.favorites.filter(
        (fav) => fav.playerid !== action.payload
      );
      return { ...state, favorites: update_remove };

    case clear_favorites:
      return { ...state, favorites: [] };
    default:
      return state;
  }
};

const reco_reducer = (state = initial, action) => {
  switch (action.type) {
    case "update_reco":
      const updated = { ...state.matrix, ...action.payload };
      localStorage.setItem("matrix", JSON.stringify(updated));
      return { ...state, matrix: updated };
    case "update_playerids":
      localStorage.setItem("player_ids", JSON.stringify(action.payload));
      return { ...state, player_ids: action.payload };
    case "reset_matrix_list":
      return { ...state, matrix: action.payload, player_ids: [] };
    default:
      return state;
  }
};

export { favorites_reducer, reco_reducer };
