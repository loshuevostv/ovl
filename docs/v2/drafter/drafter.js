window.onload = function() {

fetch(new Request(unite_data_url)).then(res => res.json().then(unite => {

function pickPanel(pick) {
  var li = document.createElement("li");
  var dv = document.createElement("div");
  var img = document.createElement("img");
  li.classList.add("pick-category-"+ pick.category);
  img.src = "https://unite.pokemon.com/images/pokemon/"+ pick.name +"/roster/roster-"+ pick.name +".png";
  dv.appendChild(img);
  li.appendChild(dv);
  return li;
}

function getPickByName(pickName) {
  for (var pick of unite.picks) if (pick.name == pickName) return pick;
  return null;
}

var timerObj = null;
function resetTimer(seconds) {
  if (timerObj) clearInterval(timerObj);
  timer.classList.remove("closed");
  timer.innerHTML = seconds;
  timerObj = setInterval(() => {
    if (!parseInt(timer.innerHTML)) {
      clearInterval(timerObj); timerObj = null;
    } else timer.innerHTML = parseInt(timer.innerHTML) - 1;
  }, 1000);
}

function addTeamBan(team, pick) {
   var ul = team ? team2bans : team1bans;
   var pp = pickPanel(pick);
   pp.classList.add("banned");
   pp.classList.add("hidden");
   ul.appendChild(pp);
   document.getElementById("draft-roster-"+ pick.name).classList.add("hidden");
   setTimeout(() => pp.classList.remove("hidden"), 300);
}

function addTeamPick(team, pick) {
   var ul = team ? team2picks : team1picks;
   var pp = pickPanel(pick);
   pp.classList.add("hidden");
   ul.appendChild(pp);
   document.getElementById("draft-roster-"+ pick.name).classList.add("hidden");
   setTimeout(() => pp.classList.remove("hidden"), 300);
}


function retrieveJSONData(cb) {
   fetch(new Request(url)).then(response => response.json().then(data => cb(data)));
}

function ts() { return parseInt(Date.now()/1000); }

function syncDraftState(data) {
   console.log(data);
   team1name.innerHTML = data.team1;
   team2name.innerHTML = data.team2;
   team1name.classList.remove("hidden");
   team2name.classList.remove("hidden");

   for (var pickName of data.teamBans[0]) addTeamBan(0, getPickByName(pickName));
   for (var pickName of data.teamBans[1]) addTeamBan(1, getPickByName(pickName));

   for (var pickName of data.teamPicks[0]) addTeamPick(0, getPickByName(pickName));
   for (var pickName of data.teamPicks[1]) addTeamPick(1, getPickByName(pickName));
}

var finished = false;
var lastUpdate = 0;
function updateDraftState(data) {
   if (!data && lastUpdate) window.location.reload();
   if (finished && data.lastTimestamp != lastUpdate) window.location.reload();
   if (!data || data.lastTimestamp == lastUpdate) return;

   if (data.currentAction == 2) finished = true;

   if (data.ongoingTimer) resetTimer(data.allowedTime);
   else timer.classList.add("closed");

   var ignoreLastAction = false;
   if (lastUpdate == 0) {
     lastUpdate = data.lastTimestamp;
     syncDraftState(data);
     ignoreLastAction = true;
   }
   lastUpdate = data.lastTimestamp;

   var curteamname = data.currentTeam ? team2name.innerHTML : team1name.innerHTML;
   if (data.currentAction == 0) dtext.innerHTML = curteamname + "<br />sta scegliendo un ban";
   else if (data.currentAction == 1) dtext.innerHTML = curteamname + "<br />sta scegliendo un pick";
   else dtext.innerHTML = "Draft concluso!";

   if (ignoreLastAction) return;
   var action = data.lastAction;

   if (action.action == 0) addTeamBan(action.team, getPickByName(action.pick));
   else addTeamPick(action.team, getPickByName(action.pick));

   var teampicks = action.team ? team2picks : team1picks;
   var otherteampicks = action.team ? team1picks : team2picks;
   for (var li of otherteampicks.children) li.classList.remove("last-selected");

   if (finished)
     for (var li of otherteampicks.children) li.classList.remove("last-selected");
   else teampicks.children[teampicks.childElementCount - 1].classList.add("last-selected");
}

var dtext = document.getElementById("draft-text");
var timer = document.getElementById("timer");
var team1name = document.getElementById("team1-name");
var team2name = document.getElementById("team2-name");
var team1picks = document.getElementById("draft-picks-team1");
var team2picks = document.getElementById("draft-picks-team2");
var team1bans = document.getElementById("draft-bans-team1");
var team2bans = document.getElementById("draft-bans-team2");

for (var pick of unite.picks) {
  var pp = pickPanel(pick);
  pp.id = "draft-roster-"+ pick.name;
  document.getElementById("draft-all-picks").appendChild(pp);
}

setInterval(() => { retrieveJSONData(updateDraftState) }, 1000);

}));
};