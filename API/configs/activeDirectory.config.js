const { AD_URL, AD_BASEDN, AD_ADMIN_DN, AD_ADMIN_PASSWORD } = process.env


const config_ad = {
    url: AD_URL,
    baseDN: AD_BASEDN,
    username: AD_ADMIN_DN,
    password: AD_ADMIN_PASSWORD   
}

module.exports = config_ad