export function mockUseRouter() {
    return {
        useRoute: () => ({
            path: '',
            query: {}
        }),
        useRouter: () => ({
            resolve: () => ({ path: '' })
        })
    };
}
