import api from '@/lib/api';
import { SetupStatus } from '@/types';

const systemService = {
    getSetupStatus: async () => {
        // Backend controller'da [AllowAnonymous] olsa da, api instance'ı token varsa ekler.
        // Eğer token yoksa ve backend [Authorize] istiyorsa 401 döner.
        // SystemController'da SetupStatus endpoint'i public olmalı veya login olmuş kullanıcıya izin vermeli.
        // Şu an login olmuş kullanıcı varsayımıyla ilerliyoruz.
        const response = await api.get<SetupStatus>('/system/setup-status');
        return response.data;
    },
};

export default systemService;
