// debugLogger.ts
// Simple, formatted logger for debugging API and process flows
// Usage: import debugLogger from '@/utils/debugLogger';

export type DebugLogOptions = {
    title: string;
    data?: any;
    error?: any;
    successMessage?: string;
    errorCode?: string | number;
};


const debugLogger = (opts: DebugLogOptions) => {
    if (!__DEV__) return; // Disable in production

    const { title, data, error, successMessage, errorCode } = opts;
    const border = '\x1b[36m' + '='.repeat(50) + '\x1b[0m'; // Cyan border
    const timestamp = new Date().toLocaleString();
    // Section headers
    const section = (label: string) => `\x1b[1m\x1b[34m${label}:\x1b[0m`;
    // Title
    console.log(`\n${border}`);
    console.log(`\x1b[1m\x1b[35m🔎 ${title.toUpperCase()}\x1b[0m`);
    console.log(`\x1b[2m${timestamp}\x1b[0m`);
    if (data !== undefined) {
        console.log(section('Data'));
        try {
            console.log('\x1b[32m' + JSON.stringify(data, null, 2) + '\x1b[0m');
        } catch (e) {
            console.log(data);
        }
    }
    if (successMessage) {
        console.log(`\x1b[1m\x1b[32m✅ Success: ${successMessage}\x1b[0m`);
    }
    if (error) {
        console.log(`\x1b[1m\x1b[31m❌ Error${errorCode ? ` [${errorCode}]` : ''}:\x1b[0m`);
        if (typeof error === 'object') {
            try {
                console.log('\x1b[31m' + JSON.stringify(error, null, 2) + '\x1b[0m');
            } catch (e) {
                console.log(error);
            }
        } else {
            console.log(error);
        }
    }
    console.log(border + '\n');
};

export default debugLogger;
