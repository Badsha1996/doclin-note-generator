from .exceptions import AuthExceptionError
from ..config.config import settings
from authlib.integrations.httpx_client import AsyncOAuth2Client
from ..core.entities.user_entities import OAuthProvider, OAuthUser

class OAuthManager:
    def __init__(self):
        self.providers = {
            OAuthProvider.GOOGLE: {
                'client_id': settings.GOOGLE_CLIENT_ID,
                'client_secret': settings.GOOGLE_CLIENT_SECRET,
                'authorize_url': settings.GOOLE_REDIRECT,
                'token_url': settings.GOOGLE_TOKEN_URL,
                'userinfo_url': settings.GOOGLE_USER_URL
            },
            OAuthProvider.META: {
                'client_id': settings.META_ID,
                'client_secret': settings.META_SECRET,
                'authorize_url': settings.META_REDIRECT,
                'token_url': settings.META_TOKEN_URL,
                'userinfo_url': settings.META_USER_URL
            }
        }
    async def get_oauth_user(self, provider: OAuthProvider, code: str, redirect_uri: str) -> OAuthUser:
        provider_config = self.providers[provider]
        async with AsyncOAuth2Client(
            client_id=provider_config['client_id'],
            client_secret=provider_config['client_secret']
        ) as client:
            # Exchange code for token
            token_response = await client.fetch_token(
                provider_config['token_url'],
                code=code,
                redirect_uri=redirect_uri
            )
            userinfo_response = await client.get(
                provider_config['userinfo_url'],
                # token=token_response
            )
            if userinfo_response.status_code != 200:
                raise AuthExceptionError(userinfo_response.status_code)
            
            user_data = userinfo_response.json()
            if provider in OAuthProvider:
                return OAuthUser(
                    email=user_data['email'],
                    username=user_data['name'],
                    provider=provider,
                    provider_id=user_data['id']
                )
            

            raise AuthExceptionError(f"Unsupported OAuth provider: {provider}")

