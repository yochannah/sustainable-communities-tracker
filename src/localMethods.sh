#! /bin/bash

echo "//--- SUSTAINABLILITY INDICATORS REPO CLONING ---//"

study_repos="view/_data"
since="2022-01-18T12:48:29Z"
until="2024-01-10T12:48:29Z"

repos=("https://github.com/open-life-science/open-life-science.github.io" "https://github.com/open-life-science/branding")

echo "//--- with variables:" 
echo "  --- since: $since"
echo "  --- until: $until"

cd "$study_repos"
# If there's no dir to clone repos into, create it
# String
if [[ -e "repos" ]]; then
  echo "  - repo folder exists, skipping to clone step"
else
  echo "  - creating 'repos' dir to store shallow-cloned repos"
  mkdir repos
fi
cd repos
echo "  - Cloning study repos to $study_repos folder"

# clone them all.
clone_repo() {
  git clone --bare --shallow-since="$1" $2
}

# Get a list of repos
for repo in "${repos[@]}"; do
    clone_repo $since "$repo"
done


## use --since and --until to create short log

echo "//--- ------------------END------------------ ---//"