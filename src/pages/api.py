from flask import Flask, jsonify, request
import psycopg2
from flask_cors import CORS
from collections import OrderedDict

app = Flask(__name__)
connect = psycopg2.connect("dbname=tennis user=postgres password=tennis")
CORS(app)

@app.route('/top10')
def top10():
    cur = connect.cursor()
    cur.execute("select ranking_date, rank, player, points, name_first, name_last, ioc from rankings, players where ranking_date = 20231225 AND rankings.player = players.player_id limit 10;")
    rankings = cur.fetchall()

    top10 = []
    for row in rankings:
        top10.append({
            'ranking_date': row[0],
            'rank': row[1],
            'player': row[2],
            'points': row[3],
            'name_first': row[4],
            'name_last': row[5],
            'ioc': row[6],
        })
    
    return jsonify(top10)

@app.route('/top200')
def top200():
    cur = connect.cursor()
    cur.execute(
    """
    select 
    rankings.ranking_date, 
    rankings.rank, 
    rankings.player, 
    rankings.points, 
    players.name_first, 
    players.name_last, 
    players.ioc, 
    country.country 
    from 
        rankings
    inner join 
        players on rankings.player = players.player_id
    inner join 
        country on players.ioc = country.ioc
    where 
        rankings.ranking_date = 20231225
    order by 
        rankings.rank
    limit 200;
    """)
    players200 = cur.fetchall()

    top200 = []
    for row in players200:
        top200.append({
            'ranking_date': row[0],
            'rank': row[1],
            'player': row[2],
            'points': row[3],
            'name_first': row[4],
            'name_last': row[5],
            'ioc': row[6],
            'country': row[7],
        })
    
    return jsonify(top200)

@app.route('/rankings/<int:player_id>')
def rankings_player(player_id):
    cur = connect.cursor()
    cur.execute("select ranking_date, rank, player, points, name_first, name_last, ioc from rankings, players where ranking_date = (select max(ranking_date) from rankings where player = %s) AND rankings.player = players.player_id AND players.player_id = %s",
        (player_id,player_id))
    rankings = cur.fetchall()
    results = OrderedDict()
    playersss = []

    for row in rankings:
        player_id = row[2]
        playersss_name = (f"{row[5]}")
        playersss.append((player_id, playersss_name))

    

    for player_id, name in playersss:
        cur.execute("select ranking_date, rank, points from rankings where player = %s", (player_id,))
        rankings = cur.fetchall()

        results[name] = []

        for row in rankings:
            results[name].append({
                'ranking_date': row[0],
                'rank': row[1],
                'points': row[2],
            })

    return jsonify(results)

@app.route('/rankings/<int:player_id>/<int:player_id_2>')
def rankings_players(player_id, player_id_2):
    cur = connect.cursor()
    cur.execute("select ranking_date, rank, player, points, name_first, name_last, ioc from rankings, players where ranking_date = (select max(ranking_date) from rankings where player = %s or player = %s) AND rankings.player = players.player_id AND (players.player_id = %s or players.player_id = %s)",
        (player_id,player_id_2,player_id,player_id_2,))
    rankings = cur.fetchall()
    results = OrderedDict()
    playersss = []

    for row in rankings:
        player_id = row[2]
        playersss_name = (f"{row[5]}")
        playersss.append((player_id, playersss_name))

    

    for player_id, name in playersss:
        cur.execute("select ranking_date, rank, points from rankings where player = %s", (player_id,))
        rankings = cur.fetchall()

        results[name] = []

        for row in rankings:
            results[name].append({
                'ranking_date': row[0],
                'rank': row[1],
                'points': row[2],
            })

    return jsonify(results)

@app.route('/rankings/top10')
def rankings10():
    cur = connect.cursor()
    cur.execute("select ranking_date, rank, player, points, name_first, name_last, ioc from rankings, players where ranking_date = 20231225 AND rankings.player = players.player_id limit 10;")
    rankings10 = cur.fetchall()
    results10 = OrderedDict()
    playersss = []

    for row in rankings10:
        player_id = row[2]
        playersss_name = (f"{row[5]}")
        playersss.append((player_id, playersss_name))

    for player_id, name in playersss:
        cur.execute("select ranking_date, rank, points from rankings where player = %s", (player_id,))
        rankings10 = cur.fetchall()

        results10[name] = []

        for row in rankings10:
            results10[name].append({
                'ranking_date': row[0],
                'rank': row[1],
                'points': row[2],
            })

    return jsonify(results10)

@app.route('/tourney')
def tourney():
    cur = connect.cursor()
    cur.execute(
        "select tourney_id,date, name,sponsored_name,category,surface,speed, 'United States' AS champion_2023, EXTRACT(MONTH FROM date) AS month, 'United States' AS country, null as winner from tournaments where tourney_id = '2023-9900' union all select tourney_id,date, name,sponsored_name,category,surface,speed,CONCAT(name_first, ' ', name_last) AS champion_2023, EXTRACT(MONTH FROM date) AS month, country.country AS country, winner from tournaments, players, country where players.player_id = tournaments.winner and players.ioc = country.ioc order by date")
    tourney = cur.fetchall()

    tourney_result = []
    for row in tourney:
        tourney_result.append({
            'tourney_id': row[0],
            'week': row[1],
            'name': row[2],
            'sponsored_name': row[3],
            'category': row[4],
            'surface': row[5],
            'speed': row[6],
            'champion_2023': row[7],
            'month': row[8],
            'country': row[9],
            'winner': row[10],
        })
    
    return jsonify(tourney_result)

@app.route('/search_players')
def search_players():
    query = request.args.get('query', '')
    cur = connect.cursor()
    cur.execute(
    """
    select distinct
    players.player_id, 
    name_first || ' ' || name_last as namee, 
    hand, 
    dob, 
    height, 
    country.country,
    backhand.ohbh,
    players.ioc
from players
inner join 
    country ON country.ioc = players.ioc 
inner join 
    rankings ON rankings.player = players.player_id    
left join 
    backhand ON backhand.player_id = players.player_id
where 
    name_first ILIKE %s OR name_last ILIKE %s;
    """,
    (f"%{query}%", f"%{query}%")
)
    players = cur.fetchall()

    search_results = []
    for row in players:
        search_results.append({
            'player_id': row[0],
            'player_name': row[1],
            'hand': row[2],
            'dob': row[3],
            'height': row[4],
            'country': row[5],
            'ohbh': row[6],
            'ioc': row[7],
        })

    return jsonify(search_results)

@app.route('/search_matches')
def search_matches():
    query = request.args.get('query', '')
    cur = connect.cursor()
    cur.execute(
    """
    select 
    tournaments.category,
    tournaments.name, 
    matches.surface,
    matches.tourney_date, 
    matches.winner_id, 
    matches.winner_seed, 
    matches.winner_entry, 
    matches.winner_name, 
    winner_ioc, 
	winner_hand,
	 winner_ohbh.ohbh as winner_ohbh,
    matches.loser_id, 
    matches.loser_seed, 
    matches.loser_entry, 
    matches.loser_name, 
    loser_ioc, 
	loser_hand,
	 loser_ohbh.ohbh as loser_ohbh,
    matches.score,
    matches.round,
    matches.minutes,
	matches.best_of,
    matches.match_id,
    matches.winner_rank,
    matches.loser_rank,
    winner_country.country AS winner_country,
    loser_country.country AS loser_country
from 
    matches
inner join 
    tournaments ON matches.tourney_id = tournaments.tourney_id
inner join 
    backhand as winner_ohbh ON winner_ohbh.player_id = matches.winner_id
inner join  
     backhand as loser_ohbh ON loser_ohbh.player_id = matches.loser_id
     inner join 
    country as winner_country ON matches.winner_ioc = winner_country.ioc 
inner join 
    country as loser_country ON matches.loser_ioc = loser_country.ioc 
where 
    winner_name ILIKE %s OR loser_name ILIKE %s;
    """,
    (f"%{query}%", f"%{query}%")
)
    matches = cur.fetchall()

    search_results = []
    for row in matches:
        search_results.append({
            'category': row[0],
            'tourney_name': row[1],
            'surface': row[2],
            'tourney_date': row[3],
            'winner_id': row[4],
            'winner_seed': row[5],
            'winner_entry': row[6],
            'winner_name': row[7],
            'winner_ioc': row[8],
            'winner_hand': row[9],
            'winner_ohbh': row[10],
            'loser_id': row[11],
            'loser_seed': row[12],
            'loser_entry': row[13],
            'loser_name': row[14],
            'loser_ioc': row[15],
            'loser_hand': row[16],
            'loser_ohbh': row[17],
            'score': row[18],
            'round': row[19],
            'minutes': row[20],
            'best_of': row[21],
            'match_id': row[22],
            'winner_rank': row[23],
            'loser_rank': row[24],
            'winner_country': row[25],
            'loser_country': row[26],
        })

    return jsonify(search_results)    

@app.route('/list_players')
def list_players():
    hand = request.args.getlist('hand')
    ohbh = request.args.getlist('ohbh') 
    minage = request.args.get('minage', None)
    maxage = request.args.get('maxage', None)
    ioc = request.args.getlist('ioc')

    cur = connect.cursor()

    sql = """
    select distinct
        players.player_id, 
        name_first || ' ' || name_last as namee, 
        hand, 
        dob, 
        height, 
        country.country,
        backhand.ohbh,
        players.ioc
    from 
        players
    inner join 
        country on country.ioc = players.ioc 
    inner join 
        rankings on rankings.player = players.player_id    
    left join 
        backhand on backhand.player_id = players.player_id
    where true
    """

    filters = []
    if hand:
        sql += " and hand in %s"
        filters.append(tuple(hand))  
    if ohbh:
        sql += " and backhand.ohbh in %s"
        filters.append(tuple([v.lower() == "true" for v in ohbh]))  
    if minage:
        sql += " and EXTRACT(YEAR FROM AGE(DATE '2023-12-31', dob)) >= %s"
        filters.append(minage)
    if maxage:
        sql += " and EXTRACT(YEAR FROM AGE(DATE '2023-12-31', dob)) <= %s"
        filters.append(maxage)
    if ioc:
        sql += " and country.country ILIKE ANY (%s)"
        filters.append([f"%{v}%" for v in ioc])
    
    cur.execute(sql, filters)
    players = cur.fetchall()

    list_results = []
    for row in players:
        list_results.append({
            'player_id': row[0],
            'player_name': row[1],
            'hand': row[2],
            'dob': row[3],
            'height': row[4],
            'country': row[5],
            'ohbh': row[6],
            'ioc': row[7],
        })

    return jsonify(list_results)

@app.route('/list_matches')
def list_matches():
    hand_1 = request.args.getlist('hand_1')
    ohbh_1 = request.args.getlist('ohbh_1') 
    ioc_1 = request.args.getlist('ioc_1')
    hand_2 = request.args.getlist('hand_2')
    ohbh_2 = request.args.getlist('ohbh_2') 
    ioc_2 = request.args.getlist('ioc_2')
    surface = request.args.getlist('surface')
    category = request.args.getlist('category')
    tround = request.args.getlist('round')
    month = request.args.get('month', None)

    cur = connect.cursor()

    sql = """
    select 
    tournaments.category,
    tournaments.name, 
    matches.surface,
    matches.tourney_date, 
    matches.winner_id, 
    matches.winner_seed, 
    matches.winner_entry, 
    matches.winner_name, 
    winner_ioc, 
	winner_hand,
	 winner_ohbh.ohbh as winner_ohbh,
    matches.loser_id, 
    matches.loser_seed, 
    matches.loser_entry, 
    matches.loser_name, 
    loser_ioc, 
	loser_hand,
	 loser_ohbh.ohbh as loser_ohbh,
    matches.score,
    matches.round,
    matches.minutes,
	matches.best_of,
    matches.match_id,
    matches.winner_rank,
    matches.loser_rank,
    winner_country.country AS winner_country,
    loser_country.country AS loser_country
from 
    matches
inner join 
    tournaments ON matches.tourney_id = tournaments.tourney_id
inner join 
    backhand as winner_ohbh ON winner_ohbh.player_id = matches.winner_id
inner join  
     backhand as loser_ohbh ON loser_ohbh.player_id = matches.loser_id
     inner join 
    country as winner_country ON matches.winner_ioc = winner_country.ioc 
inner join 
    country as loser_country ON matches.loser_ioc = loser_country.ioc 
    where true
    """

    filters = []
    if hand_1:
        sql += " and winner_hand in %s"
        filters.append(tuple(hand_1))  
    if ohbh_1:
        sql += " and winner_ohbh.ohbh in %s"
        filters.append(tuple([v.lower() == "true" for v in ohbh_1]))  
    if ioc_1:
        sql += " and winner_country::text ILIKE ANY (ARRAY[%s])"
        filters.append([f"%{v}%" for v in ioc_1])
    if hand_2:
        sql += " and loser_hand in %s"
        filters.append(tuple(hand_2))  
    if ohbh_2:
        sql += " and loser_ohbh.ohbh in %s"
        filters.append(tuple([v.lower() == "true" for v in ohbh_2]))  
    if ioc_2:
        sql += " and loser_country::text ILIKE ANY (ARRAY[%s])"
        filters.append([f"%{v}%" for v in ioc_2])
    if surface:
        sql += " and matches.surface in %s"
        filters.append(tuple(surface))
    if category:
        sql += " and tournaments.category in %s"
        filters.append(tuple(category))
    if tround:
        sql += " and matches.round in %s"
        filters.append(tuple(tround))
    if month:
        sql += " and EXTRACT(MONTH FROM matches.tourney_date) = %s"
        filters.append(month)
    cur.execute(sql, filters)
    players = cur.fetchall()

    list_results = []
    for row in players:
        list_results.append({
            'category': row[0],
            'tourney_name': row[1],
            'surface': row[2],
            'tourney_date': row[3],
            'winner_id': row[4],
            'winner_seed': row[5],
            'winner_entry': row[6],
            'winner_name': row[7],
            'winner_ioc': row[8],
            'winner_hand': row[9],
            'winner_ohbh': row[10],
            'loser_id': row[11],
            'loser_seed': row[12],
            'loser_entry': row[13],
            'loser_name': row[14],
            'loser_ioc': row[15],
            'loser_hand': row[16],
            'loser_ohbh': row[17],
            'score': row[18],
            'round': row[19],
            'minutes': row[20],
            'best_of': row[21],
            'match_id': row[22],
            'winner_rank': row[23],
            'loser_rank': row[24],
            'winner_country': row[25],
            'loser_country': row[26],
        })

    return jsonify(list_results)

@app.route('/pprofile')
def pprofile():
    cur = connect.cursor()
    cur.execute(
        """
    select distinct
    players.player_id, 
    name_first || ' ' || name_last as namee, 
    hand, 
    dob, 
    height, 
    country.country,
    backhand.ohbh
    from 
        players
    inner join 
        country on country.ioc = players.ioc 
    inner join 
        rankings on rankings.player = players.player_id    
    left join 
        backhand on backhand.player_id = players.player_id
    where 
        exists (
            select 1 
            from matches 
            where matches.winner_id = players.player_id or matches.loser_id = players.player_id)
        """
    )
    pprofile_players = cur.fetchall()
    results_pprofile = []

    for row in pprofile_players:
        results_pprofile.append({
        'player_id': row[0],
        'player_name': row[1],
        'hand': row[2],
        'dob': row[3],
        'height': row[4],
        'country': row[5],
        'ohbh': row[6],
    })

    return jsonify(results_pprofile)

@app.route('/pprofile/<int:player_id>')
def pprofile_player1(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    select distinct
    players.player_id, 
    name_first || ' ' || name_last as namee, 
    hand, 
    dob, 
    height, 
    country.country,
    backhand.ohbh,
    players.ioc
    from 
        players
    inner join 
        country on country.ioc = players.ioc 
    inner join 
        rankings on rankings.player = players.player_id    
    left join 
        backhand on backhand.player_id = players.player_id
    where 
        players.player_id = %s
        """,
        (player_id,)
    )
    pprofile_player = cur.fetchall()
    
    playerinfo = []
    for row in pprofile_player:
        playerinfo.append({
            'player_id': row[0],
            'player_name': row[1],
            'hand': row[2],
            'dob': row[3],
            'height': row[4],
            'country': row[5],
            'ohbh': row[6],
            'ioc': row[7],
        })

    return jsonify(playerinfo)

@app.route('/pprofile/<int:player_id>/<int:player_id_2>')
def pprofile_player2(player_id, player_id_2):
    cur = connect.cursor()
    cur.execute(
    """
    select distinct
    players.player_id, 
    name_first || ' ' || name_last as namee, 
    hand, 
    dob, 
    height, 
    country.country,
    backhand.ohbh,
    players.ioc
    from 
        players
    inner join 
        country on country.ioc = players.ioc    
    left join 
        backhand on backhand.player_id = players.player_id
    where 
        players.player_id = %s or players.player_id = %s
        """,
        (player_id, player_id_2)
    )
    pprofile_player = cur.fetchall()
    
    playerinfo = []
    for row in pprofile_player:
        playerinfo.append({
            'player_id': row[0],
            'player_name': row[1],
            'hand': row[2],
            'dob': row[3],
            'height': row[4],
            'country': row[5],
            'ohbh': row[6],
            'ioc': row[7],

        })

    return jsonify(playerinfo)

@app.route('/breakdown/<int:player_id>')
def breakdown(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    with match_breakdown as (
  select 
    match_id, 
    matches.tourney_id,
	tournaments.category,
    tourney_name, 
    matches.surface, 
    tourney_level, 
    tourney_date, 
    winner_id, 
    winner_seed, 
    winner_entry, 
    winner_name, 
    winner_hand, 
    winner_ht, 
    winner_ioc, 
    winner_age, 
    loser_id, 
    loser_seed, 
    loser_entry, 
    loser_name, 
    loser_hand, 
    loser_ht, 
    loser_ioc, 
    loser_age, 
    score, 
    best_of, 
    CASE 
      WHEN round = 'F' AND winner_id = %s THEN 'Title Winner'
      WHEN round = 'F' AND loser_id = %s THEN 'Final'
	  WHEN round = 'SF' THEN 'Semifinal'
      WHEN round = 'QF' THEN 'Quarterfinal'
      WHEN round = 'R16' THEN 'Round of 16'
      WHEN round = 'R32' THEN 'Round of 32'
      WHEN round = 'R64' THEN 'Round of 64'
      WHEN round = 'R128' THEN 'Round of 128'
	  WHEN round = 'RR' THEN 'Round Robin'
      ELSE 'Other'
    end as round,
    minutes,
    ROW_NUMBER() OVER (
      PARTITION BY matches.tourney_id 
      ORDER BY 
        CASE 
          WHEN round = 'F'THEN 1
          WHEN round = 'SF' THEN 2
          WHEN round = 'QF' THEN 3
          WHEN round = 'R16' THEN 4
          WHEN round = 'R32' THEN 5
          WHEN round = 'R64' THEN 6
          ELSE 7
        end asc, 
        tourney_date asc, 
        match_id asc
    ) as row_no
  from matches
  inner join tournaments
    on matches.tourney_id = tournaments.tourney_id
  where (winner_id = %s or loser_id = %s) and (matches.tourney_id <> '2023-9900')
)
select round, count(*)
from match_breakdown
where row_no = 1 group by round;
        """,
        (player_id,player_id,player_id,player_id)
    )
    pprofile_breakdown = cur.fetchall()
    
    result = []
    for row in pprofile_breakdown:
        result.append({
            'result': row[0],
            'count': row[1],
        })

    return jsonify(result)

@app.route('/match/<int:match_id>')
def match(match_id):
    cur = connect.cursor()
    cur.execute(
    """
    select 
    match_id,
    tournaments.category,
    tournaments.name, 
    matches.tourney_id,
    matches.surface,
    matches.draw_size,
    tourney_level,
    tourney_date,
    match_num,
    winner_id,
    winner_seed,
    winner_entry,
    winner_name,
    winner_hand,
    winner_ht,
    winner_ioc,
    winner_age,
    loser_id,
    loser_seed,
    loser_entry,
    loser_name,
    loser_hand,
    loser_ht,
    loser_ioc,
    loser_age,
    score,
    best_of,
    round,
    minutes,
    w_ace,
    w_df,
    w_svpt,
    w_1stIn,
    w_1stWon,
    w_2ndWon,
    w_SvGms,
    w_bpSaved,
    w_bpFaced,
    l_ace,
    l_df,
    l_svpt,
    l_1stIn,
    l_1stWon,
    l_2ndWon,
    l_SvGms,
    l_bpSaved,
    l_bpFaced,
    winner_rank,
    winner_rank_points,
    loser_rank,
    loser_rank_points,
	winner_country.country AS winner_country,
	winner_ohbh.ohbh as winner_ohbh,
	loser_country.country AS loser_country,
	loser_ohbh.ohbh as loser_ohbh,
    tournaments.sponsored_name,
    playersw.name_last as playersw,
    playersl.name_last as playersl
from 
    matches
inner join 
    tournaments ON matches.tourney_id = tournaments.tourney_id
inner join 
    country as winner_country ON matches.winner_ioc = winner_country.ioc 
inner join 
    country as loser_country ON matches.loser_ioc = loser_country.ioc 
inner join 
    backhand as winner_ohbh ON winner_ohbh.player_id = matches.winner_id
inner join  
     backhand as loser_ohbh ON loser_ohbh.player_id = matches.loser_id
inner join  
     players as playersw ON playersw.player_id = matches.winner_id
inner join  
     players as playersl ON playersl.player_id = matches.loser_id     
where 
    matches.match_id = %s
        """,
        (match_id,)
    )
    match = cur.fetchall()
    
    match_result = []
    for row in match:
        match_result.append({
            'match_id': row[0],
            'category': row[1],
            'tourney_name': row[2],
            'tourney_id': row[3],
            'surface': row[4],
            'draw_size': row[5],
            'tourney_level': row[6],
            'tourney_date': row[7],
            'match_num': row[8],
            'winner_id': row[9],
            'winner_seed': row[10],
            'winner_entry': row[11],
            'winner_name': row[12],
            'winner_hand': row[13],
            'winner_ht': row[14],
            'winner_ioc': row[15],
            'winner_age': row[16],
            'loser_id': row[17],
            'loser_seed': row[18],
            'loser_entry': row[19],
            'loser_name': row[20],
            'loser_hand': row[21],
            'loser_ht': row[22],
            'loser_ioc': row[23],
            'loser_age': row[24],
            'score': row[25],
            'best_of': row[26],
            'round': row[27],
            'minutes': row[28],
            'w_ace' :row[29], 
            'w_df' :row[30], 
            'w_svpt' :row[31], 
            'w_1stIn' :row[32], 
            'w_1stWon' :row[33], 
            'w_2ndWon' :row[34], 
            'w_SvGms' :row[35], 
            'w_bpSaved' :row[36], 
            'w_bpFaced' :row[37], 
            'l_ace' :row[38], 
            'l_df' :row[39], 
            'l_svpt' :row[40], 
            'l_1stIn' :row[41], 
            'l_1stWon' :row[42], 
            'l_2ndWon' :row[43],
            'l_SvGms' :row[44],
            'l_bpSaved' :row[45],
            'l_bpFaced' :row[46],
            'winner_rank' :row[47],
            'winner_rank_points' :row[48],
            'loser_rank' :row[49],
            'loser_rank_points' :row[50],
            'winner_country': row[51],  
            'winner_ohbh': row[52],
            'loser_country': row[53],
            'loser_ohbh': row[54],
            'sponsored_name': row[55],
            'winner_name_last': row[56],
            'loser_name_last': row[57],
            })
    return jsonify(match_result);

@app.route('/stats/total/<int:player_id>')
def stats_total(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    select sum(
    CASE 
        WHEN winner_id = %s THEN w_ace
        WHEN loser_id = %s THEN l_ace
        ELSE 0
    END
) as total_aces,
sum(
    CASE 
        WHEN winner_id = %s THEN w_df
        WHEN loser_id = %s THEN l_df
        ELSE 0
    END
) as total_df,
sum(
    CASE 
        WHEN winner_id = %s THEN w_bpsaved
        WHEN loser_id = %s THEN l_bpsaved
        ELSE 0
    END
) as total_bps,
sum(
    CASE 
        WHEN winner_id = %s THEN (l_bpfaced - l_bpsaved)
        WHEN loser_id = %s THEN (w_bpfaced - w_bpsaved)
        ELSE 0
    END
) as total_bpc
from matches
where winner_id = %s or loser_id = %s;
        """,
        (player_id,player_id,player_id,player_id, player_id, player_id, player_id, player_id,player_id,player_id)
    )
    totalstats = cur.fetchall()
    
    result = []
    for row in totalstats:
        result.append({
            't_ace': row[0],
            't_df': row[1],
            't_bps': row[2],
            't_bpc': row[3],
        })

    return jsonify(result)

@app.route('/stats/avg/<int:player_id>')
def stats_avg(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    select avg(
    CASE 
        WHEN winner_id = %s THEN w_ace
        WHEN loser_id = %s THEN l_ace
        ELSE 0
    END
) as avg_aces,
avg(
    CASE 
        WHEN winner_id = %s THEN w_df
        WHEN loser_id = %s THEN l_df
        ELSE null
    END
) as avg_df,
coalesce(sum(
        CASE 
            WHEN winner_id = %s THEN w_bpsaved
            WHEN loser_id = %s THEN l_bpsaved
            ELSE 0
        END
    ), 0) as total_bpsaved,
	    coalesce(sum(
        CASE 
            WHEN winner_id = %s THEN w_bpfaced
            WHEN loser_id = %s THEN l_bpfaced
            ELSE 0
        END
    ), 0) as total_bpfaced,
    coalesce(sum(
        CASE 
            WHEN winner_id = %s THEN l_bpfaced
            WHEN loser_id = %s THEN w_bpfaced
            ELSE 0
        END
    ), 0) as total_oppobpfaced,
    coalesce(sum(
        CASE 
            WHEN winner_id = %s THEN (l_bpfaced - l_bpsaved)
            WHEN loser_id = %s THEN (w_bpfaced - w_bpsaved)
            ELSE 0
        END
    ), 0) as total_bpconverted,

avg(coalesce(fstin,0)) as avg_fstin, avg(coalesce(fstwin,0)) as avg_fstwin, avg(coalesce(sstwin,0)) as avg_sstwin
from (
    select 
        CASE 
            WHEN winner_id = %s AND w_svpt > 0 THEN (CAST(w_1stin AS FLOAT) / CAST(w_svpt AS FLOAT))
            WHEN loser_id = %s AND l_svpt > 0 THEN (CAST(l_1stin AS FLOAT) / CAST(l_svpt AS FLOAT))
            ELSE NULL
        END AS fstin,
        CASE 
            WHEN winner_id = %s AND w_1stin > 0 THEN (CAST(w_1stwon AS FLOAT) / CAST(w_1stin AS FLOAT))
            WHEN loser_id = %s AND l_1stin > 0 THEN (CAST(l_1stwon AS FLOAT) / CAST(l_1stin AS FLOAT))
            ELSE NULL
        END AS fstwin,
		CASE 
            WHEN winner_id = %s AND (w_svpt - w_1stin) > 0 THEN (CAST(w_2ndwon AS FLOAT) / CAST((w_svpt - w_1stin) AS FLOAT))
            WHEN loser_id = %s AND (l_svpt - l_1stin) > 0 THEN (CAST(l_2ndwon AS FLOAT) / CAST((l_svpt - l_1stin) AS FLOAT))
            ELSE NULL
        END AS sstwin,
		winner_id,
        loser_id,
        w_ace,
        l_ace,
        w_df,
        l_df,
        w_bpsaved,
        l_bpsaved,
        l_bpfaced,
        w_bpfaced,
        w_svpt,
        l_svpt,
        w_1stin,
        l_1stin,
        w_1stwon,
        l_1stwon,
        w_2ndwon,
        l_2ndwon
    from matches
    where (winner_id = %s or loser_id = %s)
) as sub;
        """,
        (player_id,player_id,player_id,player_id, player_id, player_id, player_id, player_id,player_id,player_id, player_id, player_id, player_id, player_id,player_id,player_id, player_id, player_id,player_id,player_id)
    )
    totalstats = cur.fetchall()
    
    result = []
    for row in totalstats:
        result.append({
            'avg_ace': row[0],
            'avg_df': row[1],
            'total_bps': row[2],
            'total_bpf': row[3],
            'total_bpo': row[4],
            'total_bpc': row[5],
            'avg_fstin': row[6],
            'avg_fstwin': row[7],
            'avg_sstwin': row[8],
        })

    return jsonify(result)

@app.route('/record/<int:player_id>')
def match_record(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    select 
	tournaments.category,
    tourney_name, 
    matches.surface,
    tourney_date, 
    winner_id, 
    winner_seed, 
    winner_entry, 
    winner_name, 
    winner_ioc,
    loser_id, 
    loser_seed, 
    loser_entry, 
    loser_name, 
    loser_ioc, 
    score,
    round,
    minutes,
    match_id
	from matches
  inner join tournaments
    on matches.tourney_id = tournaments.tourney_id

  where (winner_id = %s or loser_id = %s)
        """,
        (player_id,player_id)
    )
    match_record = cur.fetchall()
    
    result = []
    for row in match_record:
        result.append({
            'category': row[0],
            'tourney_name': row[1],
            'surface': row[2],
            'tourney_date': row[3],
            'winner_id': row[4],
            'winner_seed': row[5],
            'winner_entry': row[6],
            'winner_name': row[7],
            'winner_ioc': row[8],
            'loser_id': row[9],
            'loser_seed': row[10],
            'loser_entry': row[11],
            'loser_name': row[12],
            'loser_ioc': row[13],
            'score': row[14],
            'round': row[15],
            'minutes': row[16],
            'match_id': row[17],
        })

    return jsonify(result);

@app.route('/record/<int:player_id>/<int:player_id_2>')
def match_record_2(player_id, player_id_2):
    cur = connect.cursor()
    cur.execute(
    """
    select 
	tournaments.category,
    tourney_name, 
    matches.surface,
    tourney_date, 
    winner_id, 
    winner_seed, 
    winner_entry, 
    winner_name, 
    winner_ioc,
    loser_id, 
    loser_seed, 
    loser_entry, 
    loser_name, 
    loser_ioc, 
    score,
    round,
    minutes,
    match_id
	from matches
  inner join tournaments
    on matches.tourney_id = tournaments.tourney_id

  where (winner_id = %s and loser_id = %s) or (winner_id = %s and loser_id = %s)
        """,
        (player_id,player_id_2, player_id_2,player_id)
    )
    match_record = cur.fetchall()
    
    result = []
    for row in match_record:
        result.append({
            'category': row[0],
            'tourney_name': row[1],
            'surface': row[2],
            'tourney_date': row[3],
            'winner_id': row[4],
            'winner_seed': row[5],
            'winner_entry': row[6],
            'winner_name': row[7],
            'winner_ioc': row[8],
            'loser_id': row[9],
            'loser_seed': row[10],
            'loser_entry': row[11],
            'loser_name': row[12],
            'loser_ioc': row[13],
            'score': row[14],
            'round': row[15],
            'minutes': row[16],
            'match_id': row[17],
        })

    return jsonify(result);

@app.route('/record/rand')
def match_record_rand():
    cur = connect.cursor()
    cur.execute(
    """
    select 
	tournaments.category,
    tourney_name, 
    matches.surface,
    tourney_date, 
    winner_id, 
    winner_seed, 
    winner_entry, 
    winner_name, 
    winner_ioc,
    loser_id, 
    loser_seed, 
    loser_entry, 
    loser_name, 
    loser_ioc, 
    score,
    round,
    minutes,
    match_id,
    tournaments.sponsored_name
	from matches
  inner join tournaments
    on matches.tourney_id = tournaments.tourney_id

 order by random() limit 1;

 """)
    match_record = cur.fetchall()
    
    result = []
    for row in match_record:
        result.append({
            'category': row[0],
            'tourney_name': row[1],
            'surface': row[2],
            'tourney_date': row[3],
            'winner_id': row[4],
            'winner_seed': row[5],
            'winner_entry': row[6],
            'winner_name': row[7],
            'winner_ioc': row[8],
            'loser_id': row[9],
            'loser_seed': row[10],
            'loser_entry': row[11],
            'loser_name': row[12],
            'loser_ioc': row[13],
            'score': row[14],
            'round': row[15],
            'minutes': row[16],
            'match_id': row[17],
            'sponsored_name': row[18],
        })

    return jsonify(result);

@app.route('/prefer/<int:player_id>')
def prefer(player_id):
    cur = connect.cursor()
    cur.execute(
    """
    with player_stats as(
    select
        alls.surface,
        coalesce(winw.wins, 0) as winw,
        coalesce(alls.w_total, 0) as w_total,
        CASE 
            WHEN coalesce(alls.w_total, 0, 0) = 0 THEN 0
            ELSE coalesce(winw.wins, 0) * 1.0 / alls.w_total
        end as w_ratio
        from
        (select surface,
                count(*) filter (where winner_id = %s or loser_id = %s) as w_total
        from matches
        group by surface) alls
        left join
        (select surface, count(*) as wins
        from matches
        where winner_id = %s
        group by surface) winw ON alls.surface = winw.surface),

    ranked_stats as (
        select
            surface,
            w_ratio,
            w_total,
            ROW_NUMBER() over (order by w_ratio desc) as w_rank
        from player_stats where w_total >= 8
    )

    select
    %s as player_id,
    (select surface from ranked_stats where w_rank = 1) as w_surface,
    (select w_ratio from ranked_stats where w_rank = 1) as w_sratio
    """,
        (player_id,player_id, player_id, player_id )
    )
    prefer = cur.fetchall()

    result = []
    for row in prefer:
        result.append({
            'player_id': row[0],
            'surface': row[1],
            'ratio': row[2],
        })
    return jsonify(result);

@app.route('/prefer/<int:player_id>/<int:player_id_2>')
def prefer_2(player_id, player_id_2):
    cur = connect.cursor()
    cur.execute(
    """
    with player_stats as(
    select
        alls.surface,
        coalesce(winw.wins, 0) as winw,
        coalesce(winl.wins, 0) as winl,
        coalesce(alls.w_total, 0) as w_total,
        coalesce(alls.l_total, 0) as l_total,
        CASE 
            WHEN coalesce(alls.w_total, 0, 0) = 0 THEN 0
            ELSE coalesce(winw.wins, 0) * 1.0 / alls.w_total
        end as w_ratio,
        CASE 
            WHEN coalesce(alls.l_total, 0, 0) = 0 THEN 0
            ELSE coalesce(winl.wins, 0) * 1.0 / alls.l_total
        end as l_ratio
        from
        (select surface,
                count(*) filter (where winner_id = %s or loser_id = %s) as w_total,
                count(*) filter (where winner_id = %s or loser_id = %s) as l_total
        from matches
        group by surface) alls
        left join
        (select surface, count(*) as wins
        from matches
        where winner_id = %s
        group by surface) winw ON alls.surface = winw.surface
        left join
        (select surface, count(*) as wins
        from matches
        where winner_id = %s
        group by surface) winl ON alls.surface = winl.surface
        ),

    ranked_stats_w as (
        select
            surface,
            w_ratio,
            w_total,
            ROW_NUMBER() over (order by w_ratio desc) as w_rank
        from player_stats where w_total >= 8
    ),

    ranked_stats_l as (
    select
        surface,
        l_ratio,
        l_total,
        ROW_NUMBER() over (order by l_ratio desc) as l_rank
    from player_stats where l_total >= 8
    )

    select
    %s as winner_id,
    (select surface from ranked_stats_w where w_rank = 1) as w_surface,
    (select w_ratio from ranked_stats_w where w_rank = 1) as w_sratio,
    %s as loser_id,
    (select surface from ranked_stats_l where l_rank = 1) as l_surface,
    (select l_ratio from ranked_stats_l where l_rank = 1) as l_sratio
    """,

    (player_id, player_id,  player_id_2, player_id_2, player_id, player_id_2, player_id, player_id_2))
    
        
    prefer = cur.fetchall()
    
    result = []
    for row in prefer:
        result.append({
            'winner_id': row[0],
            'w_surface': row[1],
            'w_ratio': row[2],
            'loser_id': row[3],
            'l_surface': row[4],
            'l_ratio': row[5],
        })
    return jsonify(result);

@app.route('/recommend')
def recommend():
    age = request.args.get('age')
    hand = request.args.get('hand')
    ohbh = request.args.get('ohbh') 
    surface = request.args.get('surface')
    cur = connect.cursor()
    sql = """
    with player_info as (
    select distinct
        players.player_id, 
        name_first || ' ' || name_last AS namee, 
        hand, 
        dob, 
        height, 
        country.country,
        backhand.ohbh
    from 
        players
    inner join 
        country ON country.ioc = players.ioc 
    inner join 
        rankings ON rankings.player = players.player_id    
    left join
        backhand ON backhand.player_id = players.player_id
    where 
        exists (
            select 1 
            from matches 
            where matches.winner_id = players.player_id or matches.loser_id = players.player_id
        )
),

player_stats as (
    select
        alls.player_id,
        alls.surface,
        coalesce(winw.wins, 0) AS winw,
        coalesce(alls.w_total, 0) AS w_total,
        CASE 
            WHEN coalesce(alls.w_total, 0) = 0 THEN 0
            ELSE coalesce(winw.wins, 0) * 1.0 / alls.w_total
        end as w_ratio
    from (
        select 
            player_id,
            surface,
            count(*) AS w_total
        from (
            select winner_id AS player_id, surface from matches
            union all
            select loser_id AS player_id, surface from matches
        ) AS all_matches
        group by player_id, surface
    ) alls
    left join (
        select 
            winner_id AS player_id,
            surface,
            count(*) AS wins
        from matches
        group by winner_id, surface
    ) winw ON alls.player_id = winw.player_id AND alls.surface = winw.surface
),

ranked_stats AS (
    select
        player_id,
        surface,
        w_ratio,
		winw,
        w_total,
        ROW_NUMBER() OVER (PARTITION BY player_id ORDER BY w_ratio DESC) AS w_rank
    from player_stats 
    where w_total >= 9
),

profile as (
select
    pi.player_id,
    pi.namee,
    pi.hand,
    pi.dob,
    pi.height,
    pi.country,
    pi.ohbh,
	rs.winw,
	rs.w_total,
    rs.surface AS w_surface,
    rs.w_ratio AS w_sratio
from 
    player_info pi
join 
    ranked_stats rs ON rs.player_id = pi.player_id AND rs.w_rank = 1
where 
    rs.surface is not null AND rs.w_ratio is not null
order by random() 
    )
	
select * from profile p where 
true = true
    """

    filters = []
    if age:
        sql += " and EXTRACT(YEAR FROM AGE(DATE '2023-12-31', p.dob)) <= %s and EXTRACT(YEAR FROM AGE(DATE '2023-12-31', p.dob)) > ( %s - 5)"
        filters.append(age)
        filters.append(age)
    if hand:
        sql += " and p.hand = %s"
        filters.append(hand)  
    if ohbh:
       sql += " and p.ohbh = %s"
       filters.append(True if ohbh.lower() == "true" else False)
    if surface:
        sql += " and p.w_surface = %s"
        filters.append(surface)

    num = " limit 12;"
    sql += num
    
    cur.execute(sql, tuple(filters))
    players = cur.fetchall()

    result = []
    for row in players:
        result.append({
            'player_id': row[0],
            'player_name': row[1],
            'hand': row[2],
            'dob': row[3],
            'height': row[4],
            'country': row[5],
            'ohbh': row[6],
            'winw': row[7],
            'w_total': row[8],
            'w_surface': row[9],
            'w_ratio': row[10],
        })
    return jsonify(result);



if __name__ == '__main__':
    app.run(debug=True)




