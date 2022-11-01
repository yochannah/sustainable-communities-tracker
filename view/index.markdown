---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---

## Attention needed

<table>
<thead>
<tr>
<th>Name </th>
<th>http status</th>
<th>url</th>

</tr>
</thead>

  {% for repo in site.data.month12 %}
  {% assign reponame = repo[0] %}
  {% assign info = repo[1] %}

  {% if info.community.health_percentage %}
  {% else %}
  <tr>
    <td><a href="/repos#{{reponame | strip}}">{{ reponame }}</a></td>
    <td>{{ info.status }}</td>
    <td>{{ info.request.url }}</td>
  </tr>
  {% endif %}

  {% endfor %}

</table>

## Collected

  <table>
  <thead>
  <tr>
  <th>Name </th>
  <th>Month0 date</th>
  <th>Health%</th>
  <th>Issue time to close</th>
  <th>PR time to close</th>
  </tr>
  </thead>

    {% for repo in site.data.month12 %}
    {% assign reponame = repo[0] %}
    {% assign info = repo[1] %}

    {% if info.community.health_percentage %}
      <tr>
        <td><a href="/repos#{{reponame | strip}}">{{ reponame }}</a></td>
        <td>{{ info.dateSnapshotTaken }}</td>
        <!-- This is a proxy for whether or not the api method worked... -->
        <td>{{info.community.health_percentage}}</td>
        <td>{{info.timeToMerge.timeToClose.pr.mean.humanReadable}}</td>
        <td>{{info.timeToMerge.timeToClose.issue.mean.humanReadable}}</td>
      </tr>

    {% endif %}

    {% endfor %}

  </table>
