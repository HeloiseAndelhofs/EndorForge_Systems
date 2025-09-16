const { AD_URL, AD_BASEDN, AD_ADMIN, AD_ADMIN_PASSWORD } = process.env


const config_ad = {
    url: AD_URL,
    baseDN: AD_BASEDN,
    bindDN: AD_ADMIN,
    bindCredentials: AD_ADMIN_PASSWORD,
    tlsOptions: undefined
}

module.exports = config_ad