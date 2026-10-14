export type Question = { id: string; prompt: string; options: string[]; answer: number; explanation: string; hint: string };
export type Formula = { label: string; value: string; note?: string };
export type Lesson = {
  id: number; term: 1 | 2; title: string; topic: string; intro: string; minutes: number;
  goals: string[]; concept: string; formulas: Formula[]; example: string;
  steps: { title: string; detail: string }[]; mistake: string; checks: Question[];
};
const q = (id: string, prompt: string, options: string[], answer: number, explanation: string, hint: string): Question => ({id,prompt,options,answer,explanation,hint});
export const LESSONS: Lesson[] = [
  {
    id:1,term:1,title:"Metric units & scientific notation",topic:"Measurement",minutes:8,
    intro:"Choose a unit that fits, then give very big and very small numbers a simpler name.",
    goals:["Distinguish length, mass, capacity, area, and volume.","Write a number as a × 10ⁿ, where 1 ≤ |a| < 10."],
    concept:"A unit tells us what a number measures. Length uses meters, area uses square meters, and volume uses cubic meters. Mass uses kilograms; liters describe capacity. Scientific notation preserves a number's value while moving its decimal point: the power of ten tells you how far it moved.",
    formulas:[{label:"Length",value:"1 km = 1,000 m; 1 m = 100 cm; 1 cm = 10 mm"},{label:"Mass and capacity",value:"1 kg = 1,000 g; 1 L = 1,000 mL"},{label:"Area and volume",value:"1 m² = 10,000 cm²; 1 m³ = 1,000 L"},{label:"Scientific notation",value:"N = a × 10ⁿ",note:"1 ≤ |a| < 10; n is an integer. Zero is written as 0."}],
    example:"Write 0.00072 m in scientific notation.",
    steps:[{title:"Make the coefficient",detail:"Move the decimal four places right to get 7.2. It is between 1 and 10."},{title:"Balance the movement",detail:"Because the original number is less than 1, use a negative exponent: 10⁻⁴."},{title:"Keep the unit",detail:"0.00072 m = 7.2 × 10⁻⁴ m. Multiplying back gives the original measurement."}],
    mistake:"Area is not length. A notebook cover is measured in cm², and a box's space is measured in cm³.",
    checks:[q("1a","Which unit measures the area of a notebook cover?",["Centimeters","Square centimeters","Cubic centimeters"],1,"A cover is a two-dimensional surface. Square centimeters measure that surface; centimeters measure an edge.","Count dimensions: length has one, area has two, volume has three."),q("1b","Which is 72,000 written in scientific notation?",["72 × 10³","7.2 × 10⁻⁴","7.2 × 10⁴"],2,"7.2 × 10⁴ = 7.2 × 10,000 = 72,000. The coefficient 7.2 is between 1 and 10.","The coefficient must be smaller than 10; the original number is large.")]
  },
  {
    id:2,term:1,title:"Unit conversions",topic:"Measurement",minutes:7,
    intro:"Change the unit without changing the amount. Let the units guide the calculation.",
    goals:["Use a conversion factor so unwanted units cancel.","Convert length, area, time, and speed with the correct factor."],
    concept:"A conversion factor is a ratio of equal quantities, such as 100 cm / 1 m. Multiply so the old unit cancels. Area has two dimensions, so square a length conversion factor; volume has three, so cube it. Speed combines a distance unit and a time unit, which may both need converting.",
    formulas:[{label:"Conversion",value:"new value = given value × conversion factor"},{label:"Useful equalities",value:"1 hectare = 10,000 m²; 1 foot = 30.48 cm"},{label:"Time",value:"1 hour = 60 minutes; 1 day = 24 hours"},{label:"Speed",value:"speed = distance ÷ time"}],
    example:"Convert 72 km/h to meters per second.",
    steps:[{title:"Convert the distance",detail:"72 km/h × 1,000 m/km = 72,000 m/h."},{title:"Convert the time",detail:"One hour contains 3,600 seconds, so divide 72,000 by 3,600."},{title:"State the result",detail:"72 km/h = 20 m/s. The distance traveled in one second is 20 meters."}],
    mistake:"To convert m² to cm², multiply by 100² = 10,000, not 100. Both dimensions change.",
    checks:[q("2a","How many centimeters are in 3.2 meters?",["32 cm","320 cm","3,200 cm"],1,"3.2 × 100 = 320 cm. There are 100 centimeters in each meter.","A smaller unit needs a larger numerical value."),q("2b","Convert 2 m² to cm².",["200 cm²","2,000 cm²","20,000 cm²"],2,"Each square meter is 100 cm × 100 cm = 10,000 cm². Two square meters is 20,000 cm².","Square the length factor: 100 × 100.")]
  },
  {
    id:3,term:1,title:"Surface area: every face counts",topic:"Geometry",minutes:9,
    intro:"Imagine wrapping a gift. How much material covers the outside, and which faces are exposed?",
    goals:["Choose a surface-area formula for the solid.","Distinguish vertical height from slant height and exclude hidden faces."],
    concept:"Surface area adds the areas of a solid's exposed surfaces. A net unfolds a solid into flat shapes you can measure. Total surface area includes bases; curved or lateral area excludes them. Where two solids touch, their joined faces are hidden and should not be counted as exposed surface.",
    formulas:[{label:"Rectangular prism",value:"SA = 2(lw + lh + wh)"},{label:"Cube",value:"SA = 6s²"},{label:"Cylinder",value:"SA = 2πr² + 2πrh; curved area = 2πrh"},{label:"Cone",value:"SA = πr² + πrℓ",note:"ℓ is the slant height, not the vertical height."},{label:"Sphere",value:"SA = 4πr²"},{label:"Regular pyramid",value:"SA = B + ½Pℓ"},{label:"Right prism",value:"SA = 2B + Ph",note:"B is base area; P is base perimeter; h is perpendicular height."}],
    example:"Find the surface area of a box 3 cm long, 2 cm wide, and 4 cm high.",
    steps:[{title:"Find the three face areas",detail:"lw = 6 cm², lh = 12 cm², and wh = 8 cm²."},{title:"Count each opposite pair",detail:"The box has two of each face, so SA = 2(6 + 12 + 8)."},{title:"Add the covering",detail:"SA = 52 cm². Use square units because this measures the outside surface."}],
    mistake:"An open container has no lid. Subtract the missing face from the closed-solid formula before reporting the exposed area.",
    checks:[q("3a","A cube has 2 cm edges. What is its total surface area?",["8 cm²","16 cm²","24 cm²"],2,"Six faces × (2 × 2 cm² per face) = 24 cm². The value 8 cm³ would be its volume.","A cube has six equal square faces."),q("3b","Two cubes are joined face to face. What happens to the joined faces?",["Both are excluded from exposed area","One is counted","Both are counted"],0,"The two faces touch inside the combined solid. Neither is exposed, so subtract both from the sum of the separate surface areas.","Imagine painting only the outside of the joined shape.")]
  },
  {
    id:4,term:1,title:"Volume: the space inside",topic:"Geometry",minutes:8,
    intro:"Build a solid from layers. Then see why a cone holds less than a matching cylinder.",
    goals:["Calculate volumes of common solids.","Add or subtract volumes when a shape is made from several solids."],
    concept:"Volume measures three-dimensional space. A prism stacks an unchanged base through a perpendicular height, giving V = Bh. A pyramid or cone with the same base and height has one third of the corresponding prism or cylinder's volume. Use matching units for all dimensions before multiplying.",
    formulas:[{label:"Cube and rectangular prism",value:"V = s³; V = lwh"},{label:"Prism and pyramid",value:"V = Bh; V = ⅓Bh"},{label:"Cylinder and cone",value:"V = πr²h; V = ⅓πr²h"},{label:"Sphere",value:"V = (4/3)πr³"},{label:"Combined solids",value:"total volume = added parts − removed parts"}],
    example:"Find the volume of a cylinder with radius 3 cm and height 5 cm. Use π ≈ 3.1416.",
    steps:[{title:"Find its circular base",detail:"B = π × 3² = 9π cm²."},{title:"Stack the base through the height",detail:"V = B × h = 9π × 5 = 45π cm³."},{title:"Round at the end",detail:"45 × 3.1416 = 141.372 cm³, or about 141.37 cm³."}],
    mistake:"Use vertical height for volume. A cone's slant height belongs in its surface-area calculation.",
    checks:[q("4a","What is the volume of a cube with 3 cm edges?",["9 cm³","18 cm³","27 cm³"],2,"3 × 3 × 3 = 27 cm³. Volume uses all three dimensions.","Multiply the edge length three times."),q("4b","A cylinder holds 90 cm³. What is the volume of a cone with the same base and height?",["30 cm³","90 cm³","270 cm³"],0,"A matching cone has one third of the cylinder's volume: 90 ÷ 3 = 30 cm³.","A cone is one third of its matching cylinder.")]
  },
  {
    id:5,term:1,title:"Scale: small plans, real spaces",topic:"Everyday math",minutes:6,
    intro:"Read maps and blueprints by connecting a small drawing to its real-world dimensions.",
    goals:["Interpret a scale of 1 : n.","Convert between drawing and actual distances in consistent units."],
    concept:"A scale of 1 : 100 means one unit in the drawing represents 100 of the same units in reality. The ratio is dimensionless only after both distances use the same unit. Multiply a drawing length by the scale factor to find its actual length; divide to go back to the drawing.",
    formulas:[{label:"Scale ratio",value:"scale = drawing distance ÷ actual distance"},{label:"From drawing to reality",value:"actual distance = drawing distance × n"},{label:"From reality to drawing",value:"drawing distance = actual distance ÷ n"}],
    example:"A room is 6 m long. Draw its length at a scale of 1 : 50.",
    steps:[{title:"Match the units",detail:"6 m = 600 cm."},{title:"Apply the scale",detail:"Drawing length = 600 ÷ 50 = 12 cm."},{title:"Check the result",detail:"12 cm × 50 = 600 cm = 6 m, matching the real room."}],
    mistake:"A length scale is not an area scale. Doubling every length makes area four times as large.",
    checks:[q("5a","At 1 : 100, what does 3 cm on a plan represent?",["3 m","30 m","300 m"],0,"3 × 100 = 300 cm = 3 m. Keep the units consistent before converting.","Multiply in centimeters first, then change to meters."),q("5b","At 1 : 50, how long is a drawing of a 4 m wall?",["2 cm","8 cm","200 cm"],1,"4 m = 400 cm; 400 ÷ 50 = 8 cm on the drawing.","Convert 4 m to centimeters, then divide by 50.")]
  },
  {
    id:6,term:1,title:"Currency conversion",topic:"Everyday math",minutes:6,
    intro:"Follow the units in an exchange rate to decide when to multiply and when to divide.",
    goals:["Convert between currencies using a stated rate.","Check the direction of the rate and round an amount of money."],
    concept:"An exchange rate describes one currency in terms of another. If a practice rate is 55 pesos per US dollar, multiply dollars by 55 to get pesos. Divide pesos by 55 to get dollars. Lesson rates are illustrative, not live market rates; real transactions may also include fees.",
    formulas:[{label:"General conversion",value:"converted amount = original amount × exchange rate"},{label:"At r pesos per dollar",value:"pesos = dollars × r; dollars = pesos ÷ r"}],
    example:"At the illustrative rate of 55 pesos per dollar, convert 1,375 pesos to dollars.",
    steps:[{title:"Read the rate's direction",detail:"55 pesos equals 1 dollar, so group the pesos into sets of 55."},{title:"Divide",detail:"1,375 ÷ 55 = 25."},{title:"Label the amount",detail:"The result is 25.00 US dollars under this practice rate, before any fees."}],
    mistake:"Multiplying in both directions cannot reverse a conversion. Inspect the unit attached to the rate.",
    checks:[q("6a","At 55 pesos per dollar, how many pesos are 10 dollars?",["55 pesos","550 pesos","5,500 pesos"],1,"10 × 55 = 550 pesos. The dollars cancel against dollars in the rate.","You receive 55 pesos for each dollar."),q("6b","At the same practice rate, how many dollars are 1,100 pesos?",["20 dollars","55 dollars","60,500 dollars"],0,"1,100 ÷ 55 = 20 dollars. Division reverses the earlier multiplication.","Find how many groups of 55 fit into 1,100.")]
  },
  {
    id:7,term:1,title:"Time & elapsed duration",topic:"Everyday math",minutes:6,
    intro:"Plan a journey, cross midnight, and separate elapsed time from time spent working.",
    goals:["Convert hours, minutes, and seconds.","Find elapsed and net duration, including intervals across midnight."],
    concept:"Clock time is based on groups of 60, not 100. Convert times to a common unit before subtracting. For an interval crossing midnight, treat the end as part of the next day. Net time removes breaks from the elapsed duration.",
    formulas:[{label:"Time units",value:"1 day = 24 h; 1 h = 60 min; 1 min = 60 s"},{label:"Elapsed time",value:"elapsed = end time − start time"},{label:"Net time",value:"net time = elapsed time − breaks"}],
    example:"A task runs from 9:40 to 11:15 with a 15-minute break. Find net work time.",
    steps:[{title:"Count to the next hour",detail:"9:40 to 10:00 is 20 minutes."},{title:"Finish the interval",detail:"10:00 to 11:15 is 75 minutes, so elapsed time is 20 + 75 = 95 minutes."},{title:"Remove the break",detail:"95 − 15 = 80 minutes of work, or 1 hour 20 minutes."}],
    mistake:"1.5 hours is 1 hour 30 minutes, not 1 hour 50 minutes. Multiply the decimal fraction by 60.",
    checks:[q("7a","How many minutes are in 2.5 hours?",["125 minutes","150 minutes","250 minutes"],1,"2.5 × 60 = 150 minutes: 120 minutes plus another half hour.","One hour has 60 minutes."),q("7b","A trip runs from 23:40 to 00:20 the next day. How long is it?",["20 minutes","40 minutes","80 minutes"],1,"There are 20 minutes to midnight and 20 after it: 40 minutes total.","Split the interval at midnight.")]
  },
  {
    id:8,term:1,title:"Temperature across three scales",topic:"Measurement",minutes:6,
    intro:"Celsius, Fahrenheit, and Kelvin describe the same temperature with different scales.",
    goals:["Convert between Celsius, Fahrenheit, and Kelvin.","Apply an offset and a scale factor in the correct order."],
    concept:"Celsius to Fahrenheit needs both a scale factor and an offset. To reverse it, undo the offset first. Kelvin and Celsius have equal-sized steps but different zero points. Write K without a degree symbol; the Kelvin scale starts at absolute zero.",
    formulas:[{label:"Celsius to Fahrenheit",value:"F = (9/5)C + 32"},{label:"Fahrenheit to Celsius",value:"C = (5/9)(F − 32)"},{label:"Celsius and Kelvin",value:"K = C + 273.15; C = K − 273.15"}],
    example:"Convert 68°F to Celsius and Kelvin.",
    steps:[{title:"Remove the Fahrenheit offset",detail:"68 − 32 = 36."},{title:"Change the scale",detail:"36 × 5/9 = 20°C."},{title:"Shift to Kelvin",detail:"20 + 273.15 = 293.15 K."}],
    mistake:"For Fahrenheit to Celsius, subtract 32 before multiplying by 5/9. Parentheses matter.",
    checks:[q("8a","What is 0°C in Fahrenheit?",["0°F","32°F","100°F"],1,"(0 × 9/5) + 32 = 32°F.","Even at zero Celsius, the Fahrenheit offset remains."),q("8b","What is 25°C in Kelvin?",["248.15 K","273.15 K","298.15 K"],2,"25 + 273.15 = 298.15 K. Kelvin uses the same size step as Celsius.","Add 273.15 to the Celsius reading.")]
  },
  {
    id:9,term:2,title:"Right-triangle foundations",topic:"Geometry",minutes:7,
    intro:"Find a missing side, name the hypotenuse, and check whether a triangle has a right angle.",
    goals:["Identify the hypotenuse opposite the right angle.","Use the Pythagorean theorem to find a missing side."],
    concept:"In a right triangle, the hypotenuse is the longest side and sits opposite the 90° angle. The squares of the two legs add to the square of the hypotenuse. This relationship only applies to right triangles. To find a leg, subtract the other leg's square from the hypotenuse's square.",
    formulas:[{label:"Pythagorean theorem",value:"a² + b² = c²",note:"c is the hypotenuse."},{label:"Solve for a leg",value:"a = √(c² − b²)"}],
    example:"A right triangle has legs 6 m and 8 m. Find its hypotenuse.",
    steps:[{title:"Square the legs",detail:"6² = 36 and 8² = 64."},{title:"Add",detail:"c² = 36 + 64 = 100."},{title:"Take the positive square root",detail:"c = √100 = 10 m. A side length is positive."}],
    mistake:"Adding side lengths does not give the hypotenuse. Add their squares, then take a square root.",
    checks:[q("9a","A right triangle has legs 6 and 8. How long is the hypotenuse?",["10","12","14"],0,"√(6² + 8²) = √100 = 10. This is longer than either leg, as expected.","Square, add, then square-root."),q("9b","The hypotenuse is 13 cm and one leg is 5 cm. Find the other leg.",["8 cm","12 cm","18 cm"],1,"√(13² − 5²) = √(169 − 25) = √144 = 12 cm.","The unknown is a leg, so subtract the squares.")]
  },
  {
    id:10,term:2,title:"Sine, cosine & tangent",topic:"Geometry",minutes:8,
    intro:"Choose an angle and watch the side labels turn into useful ratios.",
    goals:["Name opposite, adjacent, and hypotenuse relative to an acute angle.","Choose a trigonometric ratio and use degree mode."],
    concept:"Opposite and adjacent depend on the angle you choose; the hypotenuse does not. Sine connects opposite and hypotenuse, cosine connects adjacent and hypotenuse, and tangent connects opposite and adjacent. Use a calculator in degree mode when the angle is given in degrees.",
    formulas:[{label:"Sine",value:"sin θ = opposite / hypotenuse"},{label:"Cosine",value:"cos θ = adjacent / hypotenuse"},{label:"Tangent",value:"tan θ = opposite / adjacent"}],
    example:"A right triangle has a 30° angle and a 10 cm hypotenuse. Find the side opposite 30°.",
    steps:[{title:"Choose the ratio",detail:"Opposite and hypotenuse belong to sine: sin 30° = opposite / 10."},{title:"Rearrange",detail:"opposite = 10 × sin 30°."},{title:"Evaluate",detail:"sin 30° = 0.5, so the opposite side is 5 cm."}],
    mistake:"The adjacent leg is next to the chosen angle, but the hypotenuse is never called the adjacent leg.",
    checks:[q("10a","Opposite = 4 and adjacent = 3. What is tan θ?",["3/4","4/3","4/5"],1,"Tangent uses opposite divided by adjacent: 4/3. The hypotenuse is not part of this ratio.","Recall TOA: tangent = opposite / adjacent."),q("10b","The hypotenuse is 10 cm and θ = 30°. Find the opposite side.",["5 cm","8.66 cm","20 cm"],0,"Opposite = 10 sin 30° = 10 × 0.5 = 5 cm.","Use sine because you know the hypotenuse and want the opposite side.")]
  },
  {
    id:11,term:2,title:"Right & oblique triangles",topic:"Geometry",minutes:9,
    intro:"Go beyond a right angle. Match the information you have to the sine or cosine rule.",
    goals:["Choose the sine rule or cosine rule from the known sides and angles.","Match each side to its opposite angle."],
    concept:"An oblique triangle has no 90° angle. Label side a opposite angle A, and likewise b/B and c/C. The sine rule connects opposite side-angle pairs. The cosine rule finds a missing side from two sides and their included angle, or an angle from three sides. A sine-rule problem with two sides and a non-included angle may have zero, one, or two solutions.",
    formulas:[{label:"Law of sines",value:"a/sin A = b/sin B = c/sin C"},{label:"Law of cosines",value:"c² = a² + b² − 2ab cos C"},{label:"Other sides",value:"a² = b² + c² − 2bc cos A; b² = a² + c² − 2ac cos B"},{label:"Angle sum",value:"A + B + C = 180°"}],
    example:"Two sides are 5 cm and 7 cm, with an included angle of 60°. Find the third side.",
    steps:[{title:"Choose the cosine rule",detail:"Two sides and their included angle are known: c² = 5² + 7² − 2(5)(7) cos 60°."},{title:"Evaluate the squared length",detail:"c² = 25 + 49 − 70(0.5) = 39."},{title:"Take the root",detail:"c = √39 ≈ 6.24 cm. The triangle is not right, so Pythagoras alone would be wrong."}],
    mistake:"The angle in the cosine rule must lie between the two known sides. Draw and label it before substituting.",
    checks:[q("11a","You know two sides and their included angle. Which rule directly finds the third side?",["Pythagorean theorem","Law of cosines","Area = base × height"],1,"The cosine rule includes two sides and their included angle. Pythagoras only covers the 90° case.","This is an SAS set of information."),q("11b","A = 30°, B = 90°, and a = 5 cm. Find b.",["2.5 cm","5 cm","10 cm"],2,"b = 5 sin 90° / sin 30° = 5 × 1 / 0.5 = 10 cm.","Match side a with angle A, and side b with angle B.")]
  },
  {
    id:12,term:2,title:"Angles of elevation & depression",topic:"Geometry",minutes:7,
    intro:"Measure a height you cannot reach using a distance, a sightline, and a horizontal reference.",
    goals:["Identify angles measured up or down from horizontal.","Add eye height when estimating an object's total height."],
    concept:"An angle of elevation looks upward from horizontal; an angle of depression looks downward. For a level-ground model, the vertical rise divided by the horizontal distance is tangent of the angle. The rise begins at the observer's eye level, so add eye height to get total height above the ground.",
    formulas:[{label:"Height above eye level",value:"h = d tan θ"},{label:"Horizontal distance",value:"d = h / tan θ"},{label:"Total height",value:"total height = d tan θ + eye height"}],
    example:"You stand 12 m from a pole. Its top is at 45° elevation, and your eyes are 1.5 m above level ground.",
    steps:[{title:"Find the rise above your eyes",detail:"h = 12 tan 45° = 12 × 1 = 12 m."},{title:"Add the eye height",detail:"Total height = 12 + 1.5."},{title:"State the model's result",detail:"The pole is 13.5 m tall, assuming the ground between you and the pole is level."}],
    mistake:"Measure elevation from horizontal, not from the vertical pole. Remember that h may start at eye level.",
    checks:[q("12a","At 10 m horizontal distance, the elevation is 45°. How far above eye level is the top?",["5 m","10 m","20 m"],1,"10 tan 45° = 10 × 1 = 10 m above eye level.","tan 45° = 1."),q("12b","The rise above the observer's eyes is 8 m; eye height is 1.6 m. Find total height.",["6.4 m","8 m","9.6 m"],2,"8 + 1.6 = 9.6 m. The 8 m starts at eye level, not at the ground.","Include the vertical distance from the ground to the eyes.")]
  },
  {
    id:13,term:2,title:"Bearings & navigation",topic:"Everyday math",minutes:8,
    intro:"Set north as your starting point and describe a direction with a clockwise turn.",
    goals:["Read three-digit clockwise bearings from north.","Find displacement and account for the correct quadrant."],
    concept:"A bearing is measured clockwise from north: east is 090°, south is 180°, and west is 270°. For east displacement E and north displacement N, a right triangle gives the straight-line distance. The simple inverse-tangent ratio needs a quadrant check; atan2(E, N) handles all quadrants when normalized to 0°–360°.",
    formulas:[{label:"Displacement",value:"d = √(E² + N²)"},{label:"General clockwise bearing",value:"bearing = (atan2(E, N) in degrees + 360) mod 360",note:"At zero displacement, the bearing is undefined."},{label:"Northeast quadrant only",value:"θ = tan⁻¹(E/N)",note:"For other quadrants, use atan2 or correct the angle using a sketch."}],
    example:"Walk 3 km east, then 4 km north. Find your displacement from the starting point.",
    steps:[{title:"Sketch the components",detail:"E = 3 km and N = 4 km; the destination is northeast."},{title:"Find the direct distance",detail:"d = √(3² + 4²) = 5 km, while the walked path was 7 km."},{title:"Find the clockwise bearing",detail:"tan⁻¹(3/4) ≈ 36.87°, written as bearing 037° to the nearest degree."}],
    mistake:"Distance walked and straight-line displacement are different. Also, 045° and 225° point in opposite directions despite equal positive E/N ratios.",
    checks:[q("13a","Which bearing points due west?",["090°","180°","270°"],2,"Clockwise from north: east 090°, south 180°, west 270°.","Turn three right angles clockwise from north."),q("13b","E = −3 km and N = −3 km. What is the bearing?",["045°","135°","225°"],2,"Both components are negative, so the direction is southwest: 180° + 45° = 225°.","Negative east means west; negative north means south.")]
  },
  {
    id:14,term:2,title:"Area of oblique triangles",topic:"Geometry",minutes:8,
    intro:"Find a triangle's area even when its perpendicular height is not given.",
    goals:["Use two sides and the included angle for area.","Use Heron's formula when all three sides are known."],
    concept:"Any triangle's area is half its base times perpendicular height. Trigonometry supplies that height from two sides and their included angle. Heron's formula uses only the three side lengths. Check the triangle inequality first: the sum of any two sides must exceed the third.",
    formulas:[{label:"Two sides and included angle",value:"A = ½ab sin C = ½bc sin A = ½ac sin B"},{label:"Semi-perimeter",value:"s = (a + b + c) / 2"},{label:"Heron's formula",value:"A = √[s(s − a)(s − b)(s − c)]"}],
    example:"A triangle has side lengths 5 m, 5 m, and 6 m. Find its area.",
    steps:[{title:"Find the semi-perimeter",detail:"s = (5 + 5 + 6) ÷ 2 = 8 m."},{title:"Substitute into Heron's formula",detail:"A = √[8(8 − 5)(8 − 5)(8 − 6)] = √144."},{title:"Report square units",detail:"A = 12 m². Side lengths are in meters, so the area is in square meters."}],
    mistake:"Heron's s is half the perimeter, not the full perimeter. For ½ab sin C, C must be between sides a and b.",
    checks:[q("14a","Two sides are 6 m and 8 m with included angle 30°. Find the area.",["12 m²","24 m²","48 m²"],0,"½ × 6 × 8 × sin 30° = 24 × 0.5 = 12 m².","Use the included-angle formula and sin 30° = 0.5."),q("14b","A triangle has sides 5, 5, and 6. What is its semi-perimeter?",["8","16","32"],0,"(5 + 5 + 6) ÷ 2 = 8. This is the s used in Heron's formula.","Add the sides, then divide by two.")]
  },
  {
    id:15,term:2,title:"Length, distance & diagonals",topic:"Measurement",minutes:7,
    intro:"Connect speed, coordinates, and diagonals to find the length that matters.",
    goals:["Calculate distance at constant speed.","Use coordinate differences to measure straight-line distance."],
    concept:"At constant speed, distance is speed multiplied by time in matching units. On a coordinate plane, horizontal and vertical changes become the legs of a right triangle. A rectangle's diagonal uses the same relationship. A route with turns can be longer than the straight line between its endpoints.",
    formulas:[{label:"Constant speed",value:"d = vt"},{label:"Coordinate distance",value:"d = √[(x₂ − x₁)² + (y₂ − y₁)²]"},{label:"Rectangle diagonal",value:"d = √(l² + w²)"}],
    example:"Find the distance from (1, 2) to (4, 6).",
    steps:[{title:"Find the changes",detail:"Horizontal change = 4 − 1 = 3; vertical change = 6 − 2 = 4."},{title:"Use a right triangle",detail:"d = √(3² + 4²) = √25."},{title:"State the distance",detail:"The points are 5 coordinate units apart."}],
    mistake:"If speed is in km/h and time is in minutes, divide the time by 60 before multiplying.",
    checks:[q("15a","At 60 km/h, how far do you travel in 30 minutes?",["30 km","60 km","1,800 km"],0,"30 minutes is 0.5 h. Distance = 60 × 0.5 = 30 km.","Change minutes to hours to match km/h."),q("15b","Find the distance from (1, 2) to (4, 6).",["3 units","5 units","7 units"],1,"The coordinate changes are 3 and 4. √(3² + 4²) = 5 units.","Treat the changes in x and y as right-triangle legs.")]
  },
  {
    id:16,term:2,title:"Area & perimeter at home",topic:"Everyday math",minutes:8,
    intro:"Plan flooring and fencing by separating the space inside from the boundary around it.",
    goals:["Find areas and perimeters of common residential shapes.","Allow for gates and extra flooring when planning materials."],
    concept:"Area measures the surface to cover; perimeter measures the boundary to surround. A flooring project needs square units, while fencing needs length units. Subtract gate widths from a fence boundary. A waste allowance increases the flooring area by a stated percentage.",
    formulas:[{label:"Square",value:"A = s²; P = 4s"},{label:"Rectangle",value:"A = lw; P = 2(l + w)"},{label:"Triangle",value:"A = ½bh; P = a + b + c"},{label:"Circle",value:"A = πr²; circumference = 2πr"},{label:"Fencing",value:"fence length = perimeter − gate width"},{label:"Flooring allowance",value:"required area = floor area × (1 + extra rate)"},{label:"Cost",value:"total cost = quantity × cost per unit"}],
    example:"A 5 m by 4 m room needs flooring with a 10% allowance. How much should you plan for?",
    steps:[{title:"Measure the floor",detail:"A = 5 × 4 = 20 m²."},{title:"Convert the allowance",detail:"10% = 0.10. The multiplier is 1 + 0.10 = 1.10."},{title:"Include the extra",detail:"20 × 1.10 = 22 m². Round purchases up to whole packs if required."}],
    mistake:"A 10% allowance means multiply by 1.10, not 0.10. The latter gives only the extra amount.",
    checks:[q("16a","A garden is 5 m by 4 m, with a 2 m gate. How much fencing is needed?",["16 m","18 m","20 m"],0,"Perimeter = 2(5 + 4) = 18 m; subtract the 2 m gate to get 16 m.","Find the boundary, then remove the gate opening."),q("16b","A 20 m² floor needs a 10% allowance. What area should be purchased before pack rounding?",["2 m²","20 m²","22 m²"],2,"20 × 1.10 = 22 m²: the original 20 plus 2 extra.","Keep the original area and add ten percent.")]
  },
  {
    id:17,term:2,title:"Volume & capacity",topic:"Measurement",minutes:7,
    intro:"Translate a tank's dimensions into liters and work out how much more it can hold.",
    goals:["Convert cubic meters into liters.","Find liquid volume and remaining capacity from a fill fraction."],
    concept:"Volume is the space occupied by an object; capacity is the amount a container can hold. To calculate usable capacity, use the container's internal dimensions. A fill fraction describes how much of that capacity is in use. One cubic meter equals 1,000 liters, and one cubic centimeter equals one milliliter.",
    formulas:[{label:"Rectangular tank and cube",value:"V = lwh; V = s³"},{label:"Cylinder and prism",value:"V = πr²h; V = Bh"},{label:"Capacity units",value:"1 m³ = 1,000 L; 1 L = 1,000 mL; 1 cm³ = 1 mL"},{label:"Liquid volume",value:"liquid = total capacity × filled fraction"},{label:"Room to fill",value:"additional volume = capacity − current volume"}],
    example:"A tank has internal dimensions 2 m × 1 m × 1 m and is 75% full. How many more liters fit?",
    steps:[{title:"Find capacity",detail:"2 × 1 × 1 = 2 m³ = 2,000 L."},{title:"Find the current liquid",detail:"2,000 × 0.75 = 1,500 L."},{title:"Find the remaining space",detail:"2,000 − 1,500 = 500 L can be added."}],
    mistake:"Outside dimensions include the tank walls. Capacity needs the available space inside.",
    checks:[q("17a","What capacity is equivalent to 0.8 m³?",["80 L","800 L","8,000 L"],1,"0.8 × 1,000 = 800 L.","One cubic meter contains 1,000 liters."),q("17b","A 2,000 L tank is 75% full. How much more can be added?",["500 L","1,500 L","2,000 L"],0,"The empty fraction is 25%, so 2,000 × 0.25 = 500 L.","Find the empty fraction, not the filled fraction.")]
  },
  {
    id:18,term:2,title:"Material & cost estimation",topic:"Everyday math",minutes:9,
    intro:"Turn measurements into a purchase plan: subtract openings, include coats, and buy enough whole units.",
    goals:["Estimate paint or material quantities from coverage.","Round up whole-unit purchases before calculating their cost."],
    concept:"An estimate combines geometry with practical constraints. Find the area or volume that needs material, remove openings, and include the required number of coats. Divide by coverage to find material quantity. When material is sold in whole containers or packs, round up the number of packages, then calculate the purchase cost.",
    formulas:[{label:"Four rectangular walls",value:"wall area = 2h(l + w)"},{label:"Net wall area",value:"net area = wall area − doors and windows"},{label:"Paint quantity",value:"liters = (net wall area × coats) / coverage per liter"},{label:"General quantity",value:"material needed = total area or volume / coverage per unit"},{label:"Whole-container purchase",value:"containers = round up(required quantity / container size)"},{label:"Cost",value:"total cost = containers × price per container"}],
    example:"Paint 42 m² with two coats. Coverage is 10 m²/L. Paint comes in 4 L cans at 900 pesos each.",
    steps:[{title:"Include both coats",detail:"42 × 2 = 84 m² of coating."},{title:"Calculate liters and cans",detail:"84 ÷ 10 = 8.4 L. Then 8.4 ÷ 4 = 2.1 cans, so buy 3 whole cans."},{title:"Price the purchase",detail:"3 × 900 = 2,700 pesos at this illustrative price. Three cans supply 12 L."}],
    mistake:"Rounding 2.1 cans down to 2 leaves too little paint. Round up the final package count, not each intermediate calculation.",
    checks:[q("18a","42 m² needs two coats at 10 m²/L. How many liters are needed?",["4.2 L","8.4 L","84 L"],1,"42 × 2 ÷ 10 = 8.4 L. The second coat doubles the coverage requirement.","Multiply by coats before dividing by coverage."),q("18b","You need 8.4 L. Each 4 L can costs 900 pesos. What is the purchase cost?",["1,800 pesos","1,890 pesos","2,700 pesos"],2,"8.4 ÷ 4 = 2.1 cans. Round up to 3 whole cans: 3 × 900 = 2,700 pesos.","You cannot buy 0.1 of a can in this problem.")]
  }
];

export const TERMS = [{id:1 as const,title:"Measurement & everyday geometry",description:"Build confidence with units, solids, scales, money, time, and temperature."},{id:2 as const,title:"Triangles & real-world spaces",description:"Use angles and measurements to navigate, design, and estimate."}];
export const QUESTION_BANK = LESSONS.flatMap(lesson => lesson.checks.map(question => ({...question,lessonId:lesson.id,term:lesson.term,topic:lesson.topic})));
export const DEFINITIONS = [
 {term:"Area",category:"Geometry",definition:"The surface inside a two-dimensional shape, measured in square units.",formula:"Rectangle: A = lw"},
 {term:"Perimeter",category:"Geometry",definition:"The length of the boundary around a flat shape.",formula:"Rectangle: P = 2(l + w)"},
 {term:"Volume",category:"Geometry",definition:"Three-dimensional space occupied by an object, measured in cubic units.",formula:"Rectangular prism: V = lwh"},
 {term:"Capacity",category:"Measurement",definition:"How much a container can hold, using its internal dimensions.",formula:"1 m³ = 1,000 L"},
 {term:"Surface area",category:"Geometry",definition:"The total area of the exposed surfaces of a solid.",formula:"Cube: SA = 6s²"},
 {term:"Radius",category:"Geometry",definition:"The distance from a circle's center to its edge.",formula:"r = diameter / 2"},
 {term:"Hypotenuse",category:"Geometry",definition:"The side opposite the 90° angle, and the longest side of a right triangle.",formula:"c = √(a² + b²)"},
 {term:"Conversion factor",category:"Measurement",definition:"A ratio of equal quantities in different units. Multiply so the unwanted unit cancels.",formula:"100 cm / 1 m = 1"},
 {term:"Scientific notation",category:"Measurement",definition:"A number written as a coefficient between 1 and 10 in magnitude, multiplied by an integer power of ten.",formula:"7,200 = 7.2 × 10³"},
 {term:"Scale",category:"Everyday math",definition:"The ratio between a drawing length and the matching real length in the same unit.",formula:"1 : 100 means 1 cm represents 100 cm"},
 {term:"Elapsed time",category:"Everyday math",definition:"The complete duration between the start and end of an event.",formula:"elapsed = end − start"},
 {term:"Net time",category:"Everyday math",definition:"Elapsed time with breaks removed.",formula:"net = elapsed − breaks"},
 {term:"Sine",category:"Geometry",definition:"The ratio of opposite to hypotenuse for an acute angle in a right triangle.",formula:"sin θ = opposite / hypotenuse"},
 {term:"Cosine",category:"Geometry",definition:"The ratio of adjacent leg to hypotenuse for an acute angle in a right triangle.",formula:"cos θ = adjacent / hypotenuse"},
 {term:"Tangent",category:"Geometry",definition:"The ratio of opposite to adjacent for an acute angle in a right triangle.",formula:"tan θ = opposite / adjacent"},
 {term:"Oblique triangle",category:"Geometry",definition:"A triangle with no right angle. It may be acute or obtuse.",formula:"A + B + C = 180°"},
 {term:"Included angle",category:"Geometry",definition:"The angle between two specified sides of a triangle.",formula:"A = ½ab sin C, where C lies between a and b"},
 {term:"Semi-perimeter",category:"Geometry",definition:"Half of a shape's perimeter; used in Heron's triangle-area formula.",formula:"s = (a + b + c) / 2"},
 {term:"Slant height",category:"Geometry",definition:"The distance along the surface from a cone's tip to the rim, or along the middle of a regular pyramid's face.",formula:"Right cone: ℓ = √(r² + h²)"},
 {term:"Elevation angle",category:"Geometry",definition:"The angle measured upward from a horizontal line to a sightline.",formula:"rise = distance × tan θ"},
 {term:"Bearing",category:"Everyday math",definition:"A direction measured clockwise from north and commonly written using three digits.",formula:"North 000°; east 090°; south 180°; west 270°"},
 {term:"Displacement",category:"Measurement",definition:"The direct change in position from start to finish; its magnitude may be less than the path traveled.",formula:"d = √(E² + N²)"},
 {term:"Temperature",category:"Measurement",definition:"How hot or cold something is, expressed using a specified scale.",formula:"F = (9/5)C + 32"},
 {term:"Exchange rate",category:"Everyday math",definition:"How much of one currency corresponds to one unit of another.",formula:"pesos = dollars × pesos per dollar"},
 {term:"Coverage",category:"Everyday math",definition:"The area a unit of material can cover under stated conditions.",formula:"liters = area × coats / coverage per liter"},
 {term:"Allowance",category:"Everyday math",definition:"Extra material planned for cuts, waste, or other stated needs.",formula:"required area = measured area × (1 + extra rate)"}
];
