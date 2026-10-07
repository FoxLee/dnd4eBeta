import FormulaField from "../../fields/formula-field.mjs";

const { NumberField, SchemaField, StringField } = foundry.data.fields;

export default class ActivatedEffectTemplate extends foundry.abstract.DataModel {
	/** @inheritDoc */
	static defineSchema() {
		return {
			activation: new SchemaField({
				type: new StringField({ initial: "" }),
				cost: new NumberField({ min: 0, initial: 0, integer: true }),
				condition: new StringField({ initial: "" }),
			}),
			duration: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				units: new StringField({ initial: "" }),
			}),
			target: new SchemaField({
				value: new StringField({ nullable: true, initial: null }),
				width: new StringField({ nullable: true, initial: null }),
				units: new StringField({ initial: "" }),
				type: new StringField({ initial: "" }),
			}),
			range: new SchemaField({
				value: new FormulaField({ nullable: true, initial: null, deterministic: true }),
				long: new FormulaField({ nullable: true, initial: null, deterministic: true }),
				units: new StringField({ initial: "" }),
        origin: new StringField({ choices: CONFIG.DND4E.rangeOrigin }),
        form: new StringField({ choices: CONFIG.DND4E.rangeForm, nullable: true }),
        area: new FormulaField({ initial: "", deterministic: true }),
			}),
			uses: new SchemaField({
				value: new NumberField({ min: 0, initial: 0, integer: true }),
				max: new FormulaField({ initial: "0", deterministic: true }),
				per: new StringField({ nullable: true, initial: null }),
			}),
			consume: new SchemaField({
				type: new StringField({ nullable: true, initial: null }),
				target: new StringField({ nullable: true, initial: null }),
				amount: new StringField({ nullable: true, initial: null }),
			}),
		};
	}
  
  /* -------------------------------------------- */
  /*  Data Migration                              */
  /* -------------------------------------------- */

  /** @inheritdoc */
  static migrateData(source) {
    switch (source.rangeType) {
      case 'weapon':
        source.range.form = 'weapon';
        if (system?.weaponType == 'melee') {
          source.range.origin = 'melee';
        } else if (system?.weaponType == 'ranged') {
          source.range.origin = 'ranged';
          source.useWeaponRange = true;
        }
        break;
      case 'touch':
      case 'reach':
        source.range.origin = 'melee';
        break;
      case 'melee':
      case 'personal':
      case 'special':
        source.range.origin = source.rangeType;
        break;
      case 'wall':
        source.range.form = 'wall';
        break;
      default:
        break;
    }
    if (['closeBurst','closeBlast','rangeBurst','rangeBlast','wall'].includes(source.rangeType)) {
      source.range.area = source.area;
    }
    if (['closeBurst','closeBlast'].includes(source.rangeType)) {
      source.range.origin = 'close';
    }
    if (['rangeBurst','rangeBlast','wall'].includes(source.rangeType)) {
      source.range.origin = 'area';
      source.range.value = source.rangePower;
    }
    if (['closeBurst','rangeBurst'].includes(source.rangeType)) {
      source.range.form = 'burst';     
    }
    if (['closeBlast','rangeBlast'].includes(source.rangeType)) {
      source.range.form = 'blast';     
    }
    return source;
  }

}