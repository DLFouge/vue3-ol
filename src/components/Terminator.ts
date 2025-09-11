//晨昏线--根据客户端的时区和时间，计算出太阳分界线，并添加到地图上
import * as olProj from 'ol/proj';
import { Polygon } from "ol/geom";
import { Feature } from "ol";
import { map } from "./BaseMap";
import { Style, Fill } from "ol/style";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import moment from 'moment';

let offsetX: any;
let maxDimension = olProj.get('EPSG:3857').getExtent()[3];
let minDimension = olProj.get('EPSG:3857').getExtent()[1];
let declination: any;
let twilightWidth = 667918;
let twilightSteps = 13;
let points = 288;
let terminatorCurveSetCache = <any>{};
let nightFeatures = <any>[];
let twilightLayer: any = null;
const addDayNightTerminator = () => {
	for (let i = 0; i < twilightSteps; i++) {
		nightFeatures.push(new Feature({
			type: 'night'
		}));
	}
	setClock(Math.round(new Date().getTime() / 1000));//设置时间，不设置则为当前时间 '2022-08-05 15:33'
	twilightLayer = new VectorLayer({
		source: new VectorSource({
			features: [].concat(nightFeatures)
		}),
		opacity: 0.2,
		style:new Style({
		 	fill: new Fill({
			 	color: 'rgba(0,0,0,0.4)'
		 	})
	 	})
	});
	map.addLayer(twilightLayer);
};

const clearDayNightTerminator = () => {
	if (twilightLayer) {
		map.removeLayer(twilightLayer);
		twilightLayer = null;
	}
};

const generateTerminatorCurveSet = (dayOfYear:any) => {
	offsetX = maxDimension;
  declination = 0.40927971 * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81.5));
	let lineCoords = <any>[];
	for (let i = 0; i < twilightSteps; i++) {
		lineCoords.push([]);
	}
	for (let i = 0; i < points; i++) {
		let lon = minDimension + ((maxDimension - minDimension) / points * i);
		let lat = termFunction(lon);
		lineCoords[0].push([lon, lat]);
		let latDeg = olProj.toLonLat([lon, lat])[1];
		let latRad = latDeg * Math.PI / 180;
		let baseDist = (twilightWidth / (twilightSteps - 1)) / Math.cos(latRad);
		let steps = (twilightSteps - 1) / 2
		for (let j = 1; j <= steps; j++) {
			let dist = baseDist * j;
			let lonP = lonParallelFunction(dist, i);
			let latP = latParallelFunction(dist, i);
			lineCoords[j].push([lon + lonP, Math.max(lat - latP, minDimension)]);
			lineCoords[j + steps].push([lon - lonP, Math.min(lat + latP, maxDimension)]);
		}
	}
	let dayShimCoord = (declination < 0) ? minDimension : maxDimension;
  let nightShimCoord = (declination < 0) ? maxDimension : minDimension;
	return {
		curves: lineCoords,
		dayShimCoord: dayShimCoord,
		nightShimCoord: nightShimCoord
	};
}

const termFunction = (lon: any) => {
	let cosFactor = -Math.cos((lon + offsetX) * (Math.PI / maxDimension));
	return (2 * maxDimension / Math.PI) * Math.atan(cosFactor / Math.tan(declination));
};

const lonPrimeFunction = (t: any) => {
	return (maxDimension - minDimension) / points;
};

const latPrimeFunction = (t: any) => {
	let aFactor = 2 * maxDimension / Math.PI;
	let bFactor = offsetX;
	let cFactor = Math.PI / maxDimension;
	let dFactor = Math.tan(declination);
	let cosOperand = ((minDimension + (((maxDimension - minDimension) / points) * t)) + bFactor) * cFactor;
 	return (aFactor / (1 + Math.pow((-Math.cos(cosOperand) / dFactor), 2))) * (Math.sin(cosOperand) / dFactor) * (cFactor * (maxDimension - minDimension)) / points;
};

const lonParallelFunction = (dist: any, t: any) => {
	let latP = latPrimeFunction(t);
	let lonP = lonPrimeFunction(t);
	return (dist * latP) / Math.sqrt(Math.pow(lonP, 2) + Math.pow(latP, 2));
};

const latParallelFunction = (dist: any, t: any) => {
	let latP = latPrimeFunction(t);
	let lonP = lonPrimeFunction(t);
	return (dist * lonP) / Math.sqrt(Math.pow(lonP, 2) + Math.pow(latP, 2));
};

const getTerminatorCurveSet = (dayOfYear: any) => {
	if (!(dayOfYear in terminatorCurveSetCache)) {
		terminatorCurveSetCache[dayOfYear] = generateTerminatorCurveSet(dayOfYear);
	}
	return Object.assign({}, terminatorCurveSetCache[dayOfYear])
};

const setClock = (clock: any) => {
	let now = moment.unix(clock).utc();
	let baseCurveData = getTerminatorCurveSet(now.dayOfYear());
	let dayFraction = (now.hour() * 3600 + now.minute() * 60 + now.second()) / 86400;
	let offsetX = dayFraction * 2 * maxDimension;
	offsetX = Math.round(offsetX / ((2 * maxDimension) / points)) * ((2 * maxDimension) / points);
	baseCurveData.curves.forEach((curve: any, k1: any) => {
		curve.forEach((coord: any, k2: any) => {
			curve[k2][0] -= offsetX;
		})
		let count = 0;
		while (true) {
			if (count > curve.length) {
					break;
			}
			if (curve[0][0] < minDimension) {
					let coord = curve.shift();
					coord[0] += (maxDimension - minDimension);
					curve.push(coord);
			} else {
					break;
			}
			count++;
		}
		curve.push([curve[0][0] + (maxDimension - minDimension), curve[0][1]]);
		let nightCoords = curve.slice(0);
		nightCoords.push([maxDimension, baseCurveData.nightShimCoord], [minDimension, baseCurveData.nightShimCoord], curve[0]);
		/*nightCoords.forEach((coord, i) => {                  //如果地图是4326坐标系，需要在这里转化
				nightCoords[i] = olProj.transform(nightCoords[i],'EPSG:3857','EPSG:4326')
		});*/
		let nightGeometry = new Polygon([nightCoords]);
		nightFeatures[k1].setGeometry(nightGeometry);
	})
};




export {
	addDayNightTerminator,
	clearDayNightTerminator
}