/* tslint:disable quotemark */
import multi from '../../../src/compile/selection/multi';
import * as selection from '../../../src/compile/selection/selection';
import {parseUnitModelWithScale} from '../../util';

describe('Multi Selection', () => {
  const model = parseUnitModelWithScale({
    mark: 'circle',
    encoding: {
      x: {field: 'Horsepower', type: 'quantitative'},
      y: {field: 'Miles_per_Gallon', type: 'quantitative', bin: true},
      color: {field: 'Origin', type: 'nominal'}
    }
  });

  const selCmpts = (model.component.selection = selection.parseUnitSelection(model, {
    one: {type: 'multi'},
    two: {
      type: 'multi',
      nearest: true,
      on: 'mouseover',
      toggle: 'event.ctrlKey',
      encodings: ['y', 'color']
    },
    'thr-ee': {
      type: 'multi',
      fields: ['Horsepower'],
      init: {Horsepower: 50}
    },
    four: {
      type: 'multi',
      encodings: ['x', 'color'],
      init: {Horsepower: 50, color: 'Japan'}
    }
  }));

  it('builds tuple signals', () => {
    const oneSg = multi.signals(model, selCmpts['one']);
    expect(oneSg).toEqual([
      {
        name: 'one_tuple',
        on: [
          {
            events: selCmpts['one'].events,
            update:
              'datum && item().mark.marktype !== \'group\' ? {unit: "", fields: one_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)["_vgsid_"]]} : null',
            force: true
          }
        ]
      }
    ]);

    const twoSg = multi.signals(model, selCmpts['two']);
    expect(twoSg).toEqual([
      {
        name: 'two_tuple',
        on: [
          {
            events: selCmpts['two'].events,
            update:
              'datum && item().mark.marktype !== \'group\' ? {unit: "", fields: two_tuple_fields, values: [[(item().isVoronoi ? datum.datum : datum)["bin_maxbins_10_Miles_per_Gallon"], (item().isVoronoi ? datum.datum : datum)["bin_maxbins_10_Miles_per_Gallon_end"]], (item().isVoronoi ? datum.datum : datum)["Origin"]]} : null',
            force: true
          }
        ]
      }
    ]);

    const threeSg = multi.signals(model, selCmpts['thr_ee']);
    expect(threeSg).toEqual([
      {
        name: 'thr_ee_tuple',
        update: '{unit: "", fields: thr_ee_tuple_fields, values: [50]}',
        react: false,
        on: [
          {
            events: [{source: 'scope', type: 'click'}],
            update:
              'datum && item().mark.marktype !== \'group\' ? {unit: "", fields: thr_ee_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)["Horsepower"]]} : null',
            force: true
          }
        ]
      }
    ]);

    const fourSg = multi.signals(model, selCmpts['four']);
    expect(fourSg).toEqual([
      {
        name: 'four_tuple',
        update: '{unit: "", fields: four_tuple_fields, values: [50,"Japan"]}',
        react: false,
        on: [
          {
            events: [{source: 'scope', type: 'click'}],
            update:
              'datum && item().mark.marktype !== \'group\' ? {unit: "", fields: four_tuple_fields, values: [(item().isVoronoi ? datum.datum : datum)["Horsepower"], (item().isVoronoi ? datum.datum : datum)["Origin"]]} : null',
            force: true
          }
        ]
      }
    ]);

    const signals = selection.assembleUnitSelectionSignals(model, []);
    expect(signals).toEqual(expect.arrayContaining(oneSg.concat(twoSg, threeSg, fourSg)));
  });

  it('builds unit datasets', () => {
    const data: any[] = [];
    expect(selection.assembleUnitSelectionData(model, data)).toEqual([
      {name: 'one_store'},
      {name: 'two_store'},
      {name: 'thr_ee_store'},
      {name: 'four_store'}
    ]);
  });

  it('leaves marks alone', () => {
    const marks: any[] = [];
    model.component.selection = {one: selCmpts['one']};
    expect(selection.assembleUnitSelectionMarks(model, marks)).toEqual(marks);
  });
});
