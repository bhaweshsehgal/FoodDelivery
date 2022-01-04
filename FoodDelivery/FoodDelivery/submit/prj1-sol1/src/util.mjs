export class AppError {

  constructor(msg, options={}) {
    this._msg = msg;
    this._options = options;
    Object.freeze(this);
  }

  get message() {
    const codePrefix =
      (this._options.code) ? `${this._options.code}: ` : '';
    return `${codePrefix}${this._msg}`;
  }

  get options() { return this._options; }
  
}
