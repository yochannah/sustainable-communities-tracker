#! /bin/bash

echo "//-🦄- SUSTAINABLILITY INDICATORS REPO CLONING -🦄-//"

study_repos="../localData"
#repo_list="repos.txt"
repo_list="sample.tsv"

if [[ ! -e "$study_repos" ]]; then
  echo "  🚨 [FAILURE] To run this script, make sure to start your config with folder at \"$study_repos\" containing a list of repos in \"$repo_list\""
  exit
fi

cd "$study_repos"
# If there's no dir to clone repos into, create it
if [[ -e "repos" ]]; then
  echo "  🐞 [DEBUG] Folder structure exists, skipping to clone step"
else
  echo "  👉 [INFO ] Creating 'repos' and 'reports' dir to store our work"
  mkdir repos
  mkdir reports
fi

echo "  👉 [INFO ] Reading study repos list from \`${study_repos}/${repo_list}\`"
while read -r line; do 
  repos+=("$line")
done <$repo_list

cd repos
echo "  👉 [INFO ] Cloning study repos to \`$study_repos\` folder"

# clone a repo
clone_repo() {

  start_from=$1
  repo_url=$2

  echo Start: $start_from
  echo Repo: $repo_url

  saveFolder=$(sanitise_url $repo_url)
  if [[ -e $saveFolder ]]; then
    echo "  🐞 [DEBUG] Clone of \`$saveFolder\` exists. If you want to update it, delete the folder and re-run this script."
  else
    git clone --bare --shallow-since="$start_from" $repo_url $saveFolder
  fi
}

#the easiest way to consistently identify a repo is by its url, but... 

#https:// will make a filesystem angry if you put it as a filename. 
# 19 characters is brittle. will prob need to update
sanitise_url(){
  url=$1
  length=${#url}
  echo ${url:19:length}
}

save_git_log() {

  start_from=$1
  repo_url=$2

  #calculate one year from the start date: 
  year=${start_from:0:4}
  end_at=${start_from/#${year}/$((year+1))}

  gitFolder=$(sanitise_url $repo_url)
  gitLogFile="report.json"
  reportPath="reports"
  repoPath="repos"
  currentRoot="$(pwd)"
  currentReport="$currentRoot/../$reportPath/$gitFolder/$gitLogFile"
  currentRepo="$currentRoot/$repoPath/$gitFolder"
  echo "  🗂  [DEBUG] LOGFILE IS " $currentReport
  echo "  🗂  [DEBUG] Report runs from $start_from until $end_at"
  mkdir -p ../$reportPath/$gitFolder

  cd $gitFolder
  echo "[" >$currentReport
  git log --date=short --since=$start_from --until=$end_at --format="{\"author\": \"%ce\", \"date\": \"%ad\", \"commit\": \"%h\"},">>$currentReport
  echo "]" >>$currentReport
  cd -
}

#iterate through the tsv row by row, and find a start date + however many repo urls there are in the row. 

for repo in "${repos[@]}"; do
  IFS=$'\t'; readTsv=($repo); unset IFS;

  #drop the time parameter, we don't need it and the whitespace mucks things up.
  repo_since=${readTsv[2]}
  repo_since=($repo_since)

  for token in "${readTsv[@]}"; do
    isUrl=${token:0:4}
    if [[ $isUrl == "http" ]]; then
      echo "👉 [INFO ] Cloning $token, starting from $repo_since"
      clone_repo $repo_since "$token"
      save_git_log $repo_since "$token"
    fi
  done

  
done

# Get a list of repos and clone all
# for repo in "${repos[@]}"; do
#     clone_repo $since "$repo"
# done

# for repo in "${repos[@]}"; do
#     save_git_log $since "$repo"
# done

echo "//--- ----------------🌈 END 🌈---------------- ---//"