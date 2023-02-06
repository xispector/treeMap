$(document).ready(() => {

  const svg = d3.select("svg");
  const tooltip = d3.select("#tooltip");

  const svgSize = {
    width: 1400,
    height: 730
  }
  svg.attr("width", svgSize.width).attr("height", svgSize.height)

  const movieSales = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
  fetch(movieSales)
  .then(pro => pro.json())
  .then(data => {
    drawMap(data);
  })

  function drawMap (data) {
    const root = d3.hierarchy(data).sum(d => {
      return d.value
    }).sort((a, b) => b.value - a.value);
    const treemap = d3.treemap().size([1400, 600]).paddingInner(1).tile(d3.treemapBinary).paddingOuter(1);
 
    const category = (() => {
      const arr = data.children.map(d => d.name);
      const colors = d3.schemeTableau10.concat(d3.schemeSet2);
      const obj = {};
      for (let i = 0; i < arr.length; i++) {
        obj[arr[i]] = colors[i];
      }
      return obj;
    })()

    treemap(root);

    const group = svg.selectAll("g").data(root).enter().append("g")
    .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

    const checkTile = (data, ifcallback, elsecallback) => {
      if (data.depth === 2) {
        return ifcallback();
      } else {
        return elsecallback ? elsecallback() : null;
      }
    }
    group.append("rect")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("fill", d => checkTile(d, () => category[d.data.category], () => "white"))
    .attr("class", d => checkTile(d, () => "tile"))
    .attr("data-name", d => checkTile(d, () => d.data.name))
    .attr("data-category", d => checkTile(d, () => d.data.category))
    .attr("data-value", d => checkTile(d, () => d.data.value))
    .on("mouseover", () => {
        tooltip.style("opacity", 1)
      }
    )
    .on("mousemove", (event) => {
      const attr = event.target.attributes;
      if (attr["data-name"] && attr["data-category"] && attr["data-value"]) {
        const info = {
          name: attr["data-name"].value,
          category: attr["data-category"].value,
          value: attr["data-value"].value
        };
      tooltip.html(`name: ${info.name}</br>category: ${info.category}</br>value: ${info.value}`)
      .style("left", `${event.clientX + 10}px`).style("top", `${event.clientY + window.scrollY - 30}px`)
      .attr("data-value", info.value);
    }
  })
    .on("mouseout", () => {
      tooltip.style("opacity", 0)
    });

    group.append("text").selectAll("tspan").data(d => {
      const arr = d.data.name.split(" ");
      const newArr = [];
      for (let i = 0; i < arr.length; i += 2) {
        newArr.push(`${arr[i] ? arr[i] : ""} ${arr[i + 1] ? arr[i + 1] : ""} `)
      }
      return newArr;
    })
    .enter().append("tspan")
    .text(d => d).attr("y", (_, i) => 2 + 10 * i).attr("x", 2).attr("alignment-baseline", "hanging");

    const legend = svg.append("g").attr("id", "legend")
    const tag = legend.selectAll("g").data(data.children.map(d => d.name)).enter().append("g").attr("id", d => d)
    .attr("transform", (_, i) => `translate(${(i % 9) * 100}, ${Math.floor(i / 9) * 50})`);
    
    tag.append("rect")
    .attr("width", 15).attr("height", 15).attr("fill", d => category[d]).attr("stroke", "black").attr("class", "legend-item");
    tag.append("text").text(d => d)
    .attr("x", 25).attr("y", 0).attr("alignment-baseline", "hanging");

    legend.attr("transform", `translate(${svgSize.width / 2 - $("#legend")[0].getBoundingClientRect().width / 2}, ${svgSize.height - 100})`)
    
  }
})