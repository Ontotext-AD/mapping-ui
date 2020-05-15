import {Injectable} from '@angular/core';
import {Source} from 'src/app/models/source';

@Injectable({
  providedIn: 'root',
})
export class TabularDataService {

  constructor() { }

  getData(): any {
    const columnsNames = ['Trcid', 'Title', 'Shortdescription', 'Longdescription', 'Calendarsummary', 'TitleEN', 'ShortdescriptionEN', 'LongdescriptionEN', 'CalendarsummaryEN', 'Types', 'Ids', 'Locatienaam', 'City', 'Adres', 'Zipcode', 'Latitude', 'Longitude', 'Urls', 'Media', 'Thumbnail', 'Datepattern_startdate', 'Datepattern_enddate', 'Singledates', 'Type1', 'Lastupdated', 'Column'];
    return columnsNames.map(function(c) {return new Source(c)});
  }
}
