# vi: set ft=coffee:

class CNN
  constructor: (filename) ->
    


if Meteor.isClient
  Template.chart.rendered = ->
    self = @
    self.node = self.find ".chart"
    container = d3.select ".chart"

    width = $(self.node).width()

    if not self.handle
      self.handle = Deps.autorun ->
        data = root.Votes.find().fetch()
        if Deps.currentComputation.firstRun
          @chart = draw container, width, width * 0.5

        update(@chart, data)

draw = (container, w, h) ->
  margin = {top: 50, right: 20, bottom: 20, left: 20}
  width = w - margin.left - margin.right
  height = h - margin.top - margin.bottom

  chart = d3.select(".chart")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("transform", "translate(#{margin.left}, #{margin.top})")
    .attr("width", width)
    .attr("height", height)

  return chart

update = (chart, data) ->


if Meteor.isServer
  Meteor.startup(->
  )
