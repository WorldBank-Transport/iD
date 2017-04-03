import serviceMapillary from './mapillary';
import serviceNominatim from './nominatim';
import serviceOsm from './osm';
import serviceOsmRRA from './osm-rra';
import serviceTaginfo from './taginfo';
import serviceWikidata from './wikidata';
import serviceWikipedia from './wikipedia';

export var services = {
    mapillary: serviceMapillary,
    geocoder: serviceNominatim,
    osm: serviceOsm,
    osmRRA: serviceOsmRRA,
    taginfo: serviceTaginfo,
    wikidata: serviceWikidata,
    wikipedia: serviceWikipedia
};
