// majority of collision detection borrowed from http://bl.ocks.org/mbostock/3231298

var width = window.innerWidth,
		height = window.innerHeight;

// create nodes fixed to the center node
var nodes = d3.range(100).map(function() {
	return {
		radius: Math.random() * 50 + 25
	};
}),
		centerNode = nodes[0],
		color = d3.scale.category10();

centerNode.radius = 0;
centerNode.fixed = true;

// set up d3 force
var force = d3.layout.force()
		.gravity(0.01)
		.charge(function(d, i) {
			return i ? 0 : -2000;
		})
		.nodes(nodes)
		.size([width, height]);

force.start();

// set svg to window width and height
var svg = d3.select("body").append("svg")
		.attr("width", width)
		.attr("height", height);

// create svg circles
svg.selectAll('circle')
		.data(nodes.slice(1))
	.enter().append('circle')
		.attr('r', function(d) { return d.radius; })
		.style('fill', function(d, i) { return color(i%4); });

// update every tick (15ms)
force.on('tick', function(e) {
	var q = d3.geom.quadtree(nodes),
			i = 0,
			n = nodes.length;
	while (++i < n) q.visit(collide(nodes[i]));

	svg.selectAll('circle')
			.attr('cx', function(d) { return d.x; })
			.attr('cy', function(d) { return d.y; });
});

// follow the mouse
svg.on('mousemove', function() {
	var p1 = d3.mouse(this);
	centerNode.px = p1[0];
	centerNode.py = p1[1];
	force.resume();
});

// define collision with d3
function collide(node) {
	var r = node.radius + 16,
			nx1 = node.x -r,
			nx2 = node.x +r,
			ny1 = node.y -r,
			ny2 = node.y +r;

	return function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== node)) {
			var x = node.x - quad.point.x,
					y = node.y - quad.point.y,
					l = Math.sqrt(x * x + y * y),
					r = node.radius + quad.point.radius;
			if (l < r) {
				l = (l - r) / l * 0.5;
				node.x -= x *= l;
				node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
			}
		}
		return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	};
}