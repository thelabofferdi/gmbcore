# GMB CORE OS - Configuration d'Instance

## 🏢 Modèle Multi-Distributeurs

### Concept
Chaque distributeur peut acheter sa propre licence GMB CORE OS avec son ID unique.

### Attribution des Ventes

| Scénario | URL | Attribution | Source |
|----------|-----|-------------|---------|
| **Lien Affilié** | `gmbcoreos.com?ref=ABC123` | → Distributeur ABC123 | `affiliate_link` |
| **Trafic Direct** | `gmbcoreos.com` | → Propriétaire (067-2922111) | `direct_traffic` |
| **Lien Cassé** | `gmbcoreos.com?ref=` | → Propriétaire (067-2922111) | `direct_traffic` |

### Configuration Actuelle
- **Propriétaire de cette instance :** ABADA M. José Gaétan (067-2922111)
- **Toutes les ventes sans parrain** vont au propriétaire

### Pour Créer une Nouvelle Instance
1. Modifier `INSTANCE_OWNER.id` dans `referralService.ts`
2. Modifier `INSTANCE_OWNER.name` 
3. Modifier `INSTANCE_OWNER.shop`
4. Déployer sur nouveau domaine

### Exemples d'Instances
```
Instance A: gmbcoreos-distributeur-a.com (ID: 067-1111111)
Instance B: gmbcoreos-distributeur-b.com (ID: 067-2222222)  
Instance C: gmbcoreos-distributeur-c.com (ID: 067-3333333)
```

Chaque instance fonctionne indépendamment avec son propre propriétaire.
