function draw(cabinet = new Cabinet()) {
  const canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");
    canvas.style.width = "100%";
    canvas.style.height = "30* 590 /rem";
    canvas.width = canvas.offsetWidth;

    const faceframeDim = 2; // arbitrary 2in face frame
    const boxWidth = 2 * faceframeDim + cabinet.openingWidth;
    const boxHeight = 2 * faceframeDim + cabinet.openingHeight;

    const norm_factor = ctx.canvas.width / boxWidth; // normalize measurements

    canvas.height = boxHeight * norm_factor; // set canvas height based on norm_factor
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const gap = cabinet.gap * norm_factor;
    const stileRailWidth = cabinet.stileRailWidth * norm_factor;

    const outerChamferWidth = 0.5 * norm_factor; // 1/2" chamfer detail
    const innerChamferWidth = 0.25 * norm_factor; // 1/4" chamfer detail

    let xpos = 0;
    let ypos = 0;
    ctx.fillRect(xpos, ypos, boxWidth * norm_factor, boxHeight * norm_factor); // draw cabinet box, add face frame for visual effect

    xpos += faceframeDim * norm_factor - cabinet.overlay * norm_factor; // move x position to account for overlay
    ypos += faceframeDim * norm_factor - cabinet.overlay * norm_factor; // move y position to account for overlay

    cabinet.doors.forEach((door) => {
      const doorWidth = door.width * norm_factor;
      const doorHeight = door.height * norm_factor;
      const panelWidth = doorWidth - 2 * stileRailWidth;
      const panelHeight = doorHeight - 2 * stileRailWidth;

      // create gradient for chamfer detail
      const xposDoorCenter = xpos + doorWidth * 0.5;
      const yposDoorCenter = ypos + doorHeight * 0.5;
      const innerRad = doorWidth * 0.25;
      const outerRad = doorWidth;
      const innerGrad = ctx.createRadialGradient(
        xposDoorCenter,
        yposDoorCenter,
        innerRad,
        xposDoorCenter,
        yposDoorCenter,
        outerRad,
      );
      innerGrad.addColorStop(0, "white");
      innerGrad.addColorStop(1, "darkgray");
      ctx.fillStyle = innerGrad;
      ctx.fillRect(xpos, ypos, doorWidth, doorHeight); // draw door with chamfer detail gradient

      ctx.clearRect(
        xpos + outerChamferWidth,
        ypos + outerChamferWidth,
        doorWidth - 2 * outerChamferWidth,
        doorHeight - 2 * outerChamferWidth,
      ); // draw clear inside chamfer

      const outerGrad = ctx.createRadialGradient(
        xposDoorCenter,
        yposDoorCenter,
        innerRad,
        xposDoorCenter,
        yposDoorCenter,
        outerRad,
      );
      outerGrad.addColorStop(0, "white");
      outerGrad.addColorStop(1, "darkgray");
      ctx.fillStyle = outerGrad;
      ctx.fillRect(
        xpos + stileRailWidth,
        ypos + stileRailWidth,
        panelWidth,
        panelHeight,
      ); // draw panel with chamfer detail gradient
      ctx.clearRect(
        xpos + stileRailWidth + innerChamferWidth,
        ypos + stileRailWidth + innerChamferWidth,
        panelWidth - 2 * innerChamferWidth,
        panelHeight - 2 * innerChamferWidth,
      ); // draw clear inside panel chamfer

      // draw knobs
      let xposKnobCenter = 0;
      const yposKnobCenter = ypos + doorHeight - stileRailWidth * 0.5;
      const knobRad = stileRailWidth / 4; // arbitrary radius
      if (door.id % 2 == 0) {
        // draw knob in lower right corner of door
        xposKnobCenter = xpos + doorWidth - stileRailWidth * 0.5;
      } else {
        xposKnobCenter = xpos + stileRailWidth * 0.5;
      }
      const knobGrad = ctx.createRadialGradient(
        xposKnobCenter,
        yposKnobCenter,
        0,
        xposKnobCenter,
        yposKnobCenter,
        knobRad,
      );
      knobGrad.addColorStop(0, "white");
      knobGrad.addColorStop(1, "black");
      ctx.fillStyle = knobGrad;
      ctx.beginPath();
      ctx.arc(xposKnobCenter, yposKnobCenter, knobRad, 0, 2 * Math.PI);
      ctx.fill();

      xpos += doorWidth + gap; // move position to account for door width and gap between doors
    });
  }
}

function nearestFraction(decimal) {
  const allowedDenominators = [1, 2, 4, 8, 16];
  let bestNumerator = 0;
  let bestDenominator = 1;
  let minDifference = Infinity;

  for (let denominator of allowedDenominators) {
    let numerator = Math.round(decimal * denominator);
    let fraction = numerator / denominator;
    let difference = Math.abs(fraction - decimal);

    if (difference < minDifference) {
      bestNumerator = numerator;
      bestDenominator = denominator;
      minDifference = difference;
    }
  }

  let wholeNumber = Math.floor(bestNumerator / bestDenominator);
  let remainder = bestNumerator % bestDenominator;

  if (remainder === 0) {
    return `${wholeNumber}`; // Return whole number if no remainder
  }
  if (wholeNumber === 0) {
    return `${remainder}/${bestDenominator}`; // Return fraction only if no whole number part
  }
  return `${wholeNumber} ${remainder}/${bestDenominator}`; // Return mixed number
}

function showWork() {
  // Output calculations
  document.getElementById("calculations").style.display = "block";
}

class Measurement extends Number {
  constructor(num) {
    super(num);
    this.decimal = num;
    this.mixed = nearestFraction(num);
  }

  toString() {
    return `${this.mixed}"`;
  }
}
class StileRail {
  constructor(width, length) {
    this.width = new Measurement(width);
    this.length = new Measurement(length);
  }
}

class Panel {
  constructor(height, width, thickness) {
    this.height = new Measurement(height);
    this.width = new Measurement(width);
    this.thickness = new Measurement(thickness);
  }
}

class Door {
  constructor(id, height, width, stile, rail, panel) {
    this.id = id;
    this.height = new Measurement(height);
    this.width = new Measurement(width);
    this.stile = stile;
    this.rail = rail;
    this.panel = panel;
  }
}

class Cabinet {
  constructor(
    openingHeight,
    openingWidth,
    overlay,
    gap,
    numDoors,
    stileRailWidth,
    stileRailThickness,
    panelThickness,
  ) {
    this.openingHeight = new Measurement(openingHeight);
    this.openingWidth = new Measurement(openingWidth);
    this.overlay = new Measurement(overlay);
    this.gap = new Measurement(gap);
    this.numDoors = numDoors;
    this.doors = [];
    this.stileRailWidth = new Measurement(stileRailWidth);
    this.stileRailThickness = new Measurement(stileRailThickness);
    this.panelThickness = new Measurement(panelThickness);

    this.totalHeight = new Measurement(this.openingHeight + 2 * this.overlay);
    this.totalWidth = new Measurement(this.openingWidth + 2 * this.overlay);
    const doorHeight = this.totalHeight;
    const doorWidth =
      (this.totalWidth - (this.numDoors - 1) * this.gap) / this.numDoors;

    this.stileHeight = new Measurement(doorHeight);
    const stile = new StileRail(this.stileRailWidth, this.stileHeight);
    this.railLength = new Measurement(doorWidth - 2 * stileRailWidth + 0.75); // add tenon length
    const rail = new StileRail(this.stileRailWidth, this.railLength);

    const grooveDepth = 0.375; // 3/8"
    this.panelHeight = new Measurement(
      doorHeight + 2 * grooveDepth - 2 * this.stileRailWidth,
    );
    this.panelWidth = new Measurement(
      doorWidth + 2 * grooveDepth - 2 * this.stileRailWidth,
    );
    const panel = new Panel(
      this.panelHeight,
      this.panelWidth,
      this.panelThickness,
    );

    // build each Door
    for (let i = 0; i < numDoors; i++) {
      let newDoor = new Door(i, doorHeight, doorWidth, stile, rail, panel);
      this.doors.push(newDoor);
    }
  }

  description() {
    return `The cabinet opening is ${this.openingHeight} H x ${this.openingWidth} W.`;
  }
}

function calculateCutList() {
  const numDoors = parseInt(document.getElementById("numDoors").value);
  const openingWidth = parseFloat(
    document.getElementById("openingWidth").value,
  );
  const openingHeight = parseFloat(
    document.getElementById("openingHeight").value,
  );
  const stileRailWidth = parseFloat(
    document.getElementById("stileRailWidth").value,
  );
  const overlay = parseFloat(document.getElementById("overlay").value);
  const gap =
    numDoors > 1 ? parseFloat(document.getElementById("gap").value) : 0;
  const stileRailThickness = parseFloat(
    document.getElementById("stileRailThickness").value,
  );
  const panelThickness = parseFloat(
    document.getElementById("panelThickness").value,
  );

  const newCabinet = new Cabinet(
    openingHeight,
    openingWidth,
    overlay,
    gap,
    numDoors,
    stileRailWidth,
    stileRailThickness,
    panelThickness,
  );

  document.getElementById("cutlist").innerHTML = `
      <h2 class="heading-2xl">Cut List</h2>
      <p><strong>Stiles:</strong> ${newCabinet.numDoors * 2} pieces, ${nearestFraction(newCabinet.stileRailWidth)}" x ${nearestFraction(newCabinet.stileHeight)}"</p>
      <p><strong>Rails:</strong> ${newCabinet.numDoors * 2} pieces, ${nearestFraction(stileRailWidth)}" x ${nearestFraction(newCabinet.railLength)}"</p>
      <p><strong>Panels:</strong> ${newCabinet.numDoors} pieces, ${nearestFraction(newCabinet.panelWidth)}" x ${nearestFraction(newCabinet.panelHeight)}"</p>
      <h2 class="heading-2xl">Procedures</h2>
      <h3 class="heading-xl">Step 1: Cut Materials</h3>
      <ol class="disc-list">
          <li>Cut <strong>${newCabinet.numDoors * 2} stiles</strong> to <strong>${newCabinet.stileRailWidth}" x ${newCabinet.stileHeight}"</strong> from ${newCabinet.stileRailThickness}" material.</li>
          <li>Cut <strong>${newCabinet.numDoors * 2} rails</strong> to <strong>${newCabinet.stileRailWidth}" x ${newCabinet.railLength}"</strong> from ${newCabinet.stileRailThickness}" material.</li>
          <li>Cut <strong>${newCabinet.numDoors} panels</strong> to <strong>${newCabinet.panelWidth}" x ${newCabinet.panelHeight}"</strong> from ${newCabinet.panelThickness}" material.</li>
      </ol>
      <h3 class="heading-xl">Step 2: Cut the Joinery</h3>
      <h4 class="heading-xl">Grooves for the Panel</h4>
      <ol class="disc-list">
          <li>Use a <strong>router with a ${newCabinet.panelThickness}" slot cutter</strong> or a <strong>table saw with a dado blade</strong> to cut a <strong>${newCabinet.panelThickness}" wide groove, 3/8" deep</strong> along the inside edges of all stiles and rails.</li>
          <li>The panel will slide into this groove.</li>
      </ol>
      <h4 class="heading-xl">Tenons on the Rails</h4>
      <ol class="disc-list">
          <li>On the <strong>rails</strong>, cut a <strong>tenon (tongue) ${newCabinet.panelThickness}" thick and 3/8" long</strong> on each end to fit into the grooves of the stiles.</li>
          <li>You can do this using a table saw with a dado blade or a router.</li>
      </ol>
      <h3 class="heading-xl">Step 3: Dry Fit the Frame</h3>
      <ol class="disc-list">
          <li>Test fit the <strong>stiles, rails, and panel</strong> to ensure a snug fit.</li>
          <li>The panel should fit into the grooves without forcing.</li>
      </ol>
      <h3 class="heading-xl">Step 4: Assemble the Door</h3>
      <ol class="decimal-list">
          <li>Apply glue to the <strong>tenons of the rails</strong> (avoid getting glue in the panel grooves so the panel can expand/contract).</li>
          <li>Insert the <strong>panel</strong> into the grooves.</li>
          <li>Clamp the frame together and <strong>ensure the door is square</strong> by measuring diagonally.</li>
          <li>Let the glue dry for at least <strong>30 minutes to an hour</strong>.</li>
      </ol>
      <h3 class="heading-xl">Step 5: Sand and Finish</h3>
      <ol class="disc-list">
          <li>Sand the assembled doors smooth.</li>
          <li>Slightly round over or chamfer the edges for a softer look.</li>
          <li>Apply primer and paint or stain and seal.</li>
      </ol>
      <button onclick="showWork()" class="btn">Show Calculations</button>
  `;
  document.getElementById("results").style.display = "block";
  document.getElementById("cutlist").style.display = "block";

  document.getElementById("calculations").innerHTML = `
      <h2 class="heading-2xl">Calculations</h2>
      <p>Each door will have a ${newCabinet.overlay}" overlay on all outer edges and a ${newCabinet.gap}" gap between them.</p>
      <h3 class="heading-xl">Final Door Dimensions:</h3>
      <p><strong>Total width of both doors: </strong>( ${newCabinet.openingWidth}" + ${newCabinet.overlay}" + ${newCabinet.overlay}" = ${newCabinet.totalWidth}" )</p>
      <p><strong>Each door width: </strong>( (${newCabinet.totalWidth}" - ${newCabinet.gap}") / ${numDoors} = ${newCabinet.doors[0].width}" )</p>
      <p><strong>Each door height: </strong>( ${newCabinet.openingHeight}" + ${newCabinet.overlay}" + ${newCabinet.overlay}" = ${newCabinet.doors[0].height}" )</p>
      <hr/>
      <h3 class="heading-xl">Stiles (Vertical Pieces) - ${newCabinet.numDoors * 2} Pieces</h3>
      <p><strong>Width: </strong>${newCabinet.stileRailWidth}"</p>
      <p><strong>Length: </strong>${newCabinet.stileHeight}"</p>
      <h3 class="heading-xl">Rails (Horizontal Pieces) - ${newCabinet.numDoors * 2} Pieces</h3>
      <p><strong>Width: </strong>${newCabinet.stileRailWidth}"</p>
      <p><strong>Length: </strong>${newCabinet.railLength}"</p>
      <p><strong>Final Rail Length Calculation:</strong></p>
      <p><strong>Frame opening for the panel: </strong>(  ${newCabinet.doors[0].width} - (2 × ${newCabinet.stileRailWidth}) = ${new Measurement(newCabinet.doors[0].width - 2 * newCabinet.stileRailWidth)} )</p>
      <p>Each tenon extends 3/8" per end, so we add 3/4" to the rail length:</p>
      <p><strong>Final rail length: </strong>${newCabinet.railLength}"</p>
      <h3 class="heading-xl">Panels (Plywood) - ${newCabinet.numDoors} Pieces</h3>
      <p><strong>Width: </strong>${newCabinet.panelWidth}"</p>
      <p><strong>Height: </strong>${newCabinet.panelHeight}"</p>
      <p><strong>Width Calculation:</strong></p>
      <p>The panel fits into a ${newCabinet.panelThickness}" wide x 3/8" deep groove on each stile.</p>
      <p>The visible opening for the panel is ( ${new Measurement(newCabinet.doors[0].width - 2 * newCabinet.stileRailWidth)} ).</p>
      <p>The panel extends 3/8" into each stile’s groove.</p>
      <p><strong>Final panel width: </strong>( ${new Measurement(newCabinet.doors[0].width - 2 * newCabinet.stileRailWidth)} + (2 × 3/8") = ${newCabinet.panelWidth} ).</p>
      <p><strong>Height Calculation:</strong></p>
      <p>The visible opening for the panel is ( ${newCabinet.doors[0].height} - (2 × ${newCabinet.stileRailWidth}) = ${new Measurement(newCabinet.doors[0].height - 2 * newCabinet.stileRailWidth)} ).</p>
      <p>The panel extends 3/8" into each rail’s groove.</p>
      <p><strong>Final panel height: </strong>( ${new Measurement(newCabinet.doors[0].height - 2 * newCabinet.stileRailWidth)} + (2 × 3/8") = ${newCabinet.panelHeight} ).</p>
  `;
  draw(newCabinet);
}
