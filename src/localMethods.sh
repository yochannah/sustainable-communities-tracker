#! /bin/bash

echo "//--- SUSTAINABLILITY INDICATORS REPO CLONING ---//"

study_repos="view/_data"
since="2022-01-18T12:48:29Z"
until="2024-01-10T12:48:29Z"

#repos=("https://github.com/open-life-science/open-life-science.github.io" "https://github.com/open-life-science/branding")

echo "//--- with variables:" 
echo "  --- since: $since"
echo "  --- until: $until"

cd "$study_repos"
# If there's no dir to clone repos into, create it
# String
if [[ -e "repos" ]]; then
  echo "  🐞 [DEBUG] Folder structure exists, skipping to clone step"
else
  echo "  👉 [INFO ] Creating 'repos' and 'reports' dir to store our work"
  mkdir repos
  mkdir reports
fi

echo "  👉 [INFO ] Reading study repos list from \`${study_repos}/repos.txt\`"
while read -r line; do 
  repos+=("$line")
done <repos.txt

cd repos
echo "  👉 [INFO ] Cloning study repos to \`$study_repos\` folder"

# clone a repo
clone_repo() {
  saveFolder=$(sanitise_url $2)
 # echo git clone --bare --shallow-since="$1" $2 $saveFolder
  if [[ -e $saveFolder ]]; then
    echo "  🐞 [DEBUG] Clone of \`$saveFolder\` exists. If you want to update it, delete the folder and re-run this script."
  else
    git clone --bare --shallow-since="$1" $2 $saveFolder
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
  gitFolder=$(sanitise_url $2)
  gitLogFile="report.txt"
  #echo "  🗂 [DEBUG] LOGFILE IS " $gitLogFile
  cd ../reports
  mkdir -p $gitFolder

        #todo SINCE, UNTIL. 
  git log --format="{\"author\": \"%an\", \"date\": \"%ad\"}">$gitFolder/$gitLogFile
}

# Get a list of repos and clone all
for repo in "${repos[@]}"; do
    clone_repo $since "$repo"
done

## use --since and --until to create short log

for repo in "${repos[@]}"; do
    save_git_log $since "$repo"
done


echo "//--- ------------------END------------------ ---//"