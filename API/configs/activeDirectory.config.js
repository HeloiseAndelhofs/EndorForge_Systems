const { AD_URL, AD_BASEDN, AD_ADMIN_DN, AD_ADMIN_PASSWORD } = process.env


const config_ad = {
    url: AD_URL,
    baseDN: AD_BASEDN,
    bindDN: AD_ADMIN_DN,
    bindCredentials: AD_ADMIN_PASSWORD,
    tlsOptions: undefined
}

module.exports = config_ad