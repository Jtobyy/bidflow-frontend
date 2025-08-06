export const getUserFromStorage = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (e) {
        return null;
    }
};

export const getCompanyFromStorage = () => {
    try {
        const company = localStorage.getItem('company');
        return company ? JSON.parse(company) : null;
    } catch (e) {
        return null;
    }
};
    