import chalk from 'chalk';
import prettyFormat from 'pretty-format';
import createDebug from 'debug';

export default class Logger {
  title: string;

  public constructor(title: string) {
    this.title = title;
  }

  debug(...messages: unknown[]) {
    this.logger({
      title: chalk.yellow(`DEBUG ${this.title}`),
      messages,
      logFunction: createDebug(this.title)
    });
  }

  info(...messages: unknown[]) {
    this.logger({
      title: chalk.blue(this.title),
      messages,
      logFunction: console.log
    });
  }

  warn(...messages: unknown[]) {
    this.logger({
      title: chalk.yellow(`WARNING ${this.title}`),
      messages,
      logFunction: console.log
    });
  }

  error(...messages: unknown[]) {
    this.logger({
      title: chalk.red(`ERROR ${this.title}`),
      messages,
      logFunction: console.log
    });
  }

  fatal(...messages: unknown[]) {
    this.logger({
      title: chalk.red(`========= FATAL ${this.title} =========`),
      messages,
      logFunction: console.log
    });
  }

  trace(...messages: unknown[]) {
    this.logger({
      title: chalk.red(`TRACE ${this.title}`),
      messages,
      logFunction: console.log
    });
  }

  private logger({
    title,
    messages,
    logFunction
  }: {
    title: string;
    messages: (string | { [key: string]: any })[];
    logFunction: any;
  }) {
    const formattedMessages = messages
      .map((message) => {
        if (typeof message === 'string') {
          return message;
        }

        return prettyFormat(message, {
          highlight: true,
          min: true,
          theme: {
            tag: 'cyan',
            content: 'reset',
            prop: 'yellow',
            value: 'green'
          }
        });
      })
      .map((text) => this.indentText(text));
    logFunction(chalk.gray(this.time()), `[${title}]`, ...formattedMessages);
  }

  private indentText(text: string): string {
    return text.replace(/^(?!\s+$)/gm, ' '.repeat(13)).trim();
  }

  private time(): string {
    const now = new Date();
    const date = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return date.toISOString().replace(/.*T(.*)Z/, '$1');
  }
}
