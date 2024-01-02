export class CTools {
    static async sleep(n) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, n * 10);
        });
    }
}