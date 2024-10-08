export function retry(retriesGetter: () => number, delay: number = 1000): MethodDecorator {
    return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            let attempts = 0;
            let lastError: unknown;

            const retries = retriesGetter.call(this);

            while (attempts < retries) {
                try {
                    attempts++;
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    console.log(`Error ${error}. Retrying. Attempt ${attempts}`);
                    lastError = error;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            throw lastError;
        };

        return descriptor;
    };
}
