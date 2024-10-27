import React, { useState, useEffect } from 'react';

function App() {
  const [produits, setProduits] = useState([]);
  const [nouveauProduit, setNouveauProduit] = useState({ nom: '', quantite: 1 });
  const [checkedProduits, setCheckedProduits] = useState([]);

  // Charger les produits depuis le backend
  useEffect(() => {
    fetch('https://backcourses.onrender.com/api/produits')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erreur HTTP! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Données reçues du serveur :", data);
        setProduits(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des produits :", error);
      });
  }, []);

  // Ajouter un produit
  const ajouterProduit = async () => {
    if (nouveauProduit.nom) {
      const produitExistant = produits.find((produit) => produit.nom.toLowerCase() === nouveauProduit.nom.toLowerCase());

      if (produitExistant) {
        alert('Ce produit est déjà dans la liste !');
        return;
      }

      const produitSansImage = { ...nouveauProduit };

      console.log('Produit à ajouter:', produitSansImage);

      fetch('https://backcourses.onrender.com/api/produits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produitSansImage),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erreur HTTP! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          console.log("Produit ajouté :", data);
          setProduits([...produits, data]);
          setNouveauProduit({ nom: '', quantite: 1 });
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout du produit :", error);
        });
    }
  };

  // Supprimer un produit
  const supprimerProduit = (id) => {
    fetch(`https://backcourses.onrender.com/api/produits/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setProduits(produits.filter((produit) => produit._id !== id));
      })
      .catch((error) => {
        console.error("Erreur lors de la suppression du produit :", error);
      });
  };

  // Modifier la quantité
  const modifierQuantite = (id, quantite) => {
    const produitModifie = produits.find((produit) => produit._id === id);
    if (produitModifie) {
      produitModifie.quantite = quantite;

      fetch(`https://backcourses.onrender.com/api/produits/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(produitModifie),
      })
        .then(() => {
          // Mettez à jour l'état des produits en utilisant un nouveau tableau
          setProduits((prevProduits) =>
            prevProduits.map((produit) =>
              produit._id === id ? { ...produit, quantite } : produit
            )
          );
        })
        .catch((error) => {
          console.error("Erreur lors de la modification de la quantité :", error);
        });
    }
  };

  // Marquer un produit comme pris
  const toggleChecked = (id) => {
    setCheckedProduits((prev) =>
      prev.includes(id) ? prev.filter((checkedId) => checkedId !== id) : [...prev, id]
    );
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Liste de courses</h1>
      <ul className="w-full max-w-lg bg-white rounded-lg shadow-md p-4 mb-4">
        {produits.map((produit) => (
          <li key={produit._id} className="flex items-center justify-between mb-2 p-2 border-b hover:bg-gray-50 transition duration-200 ease-in-out">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={checkedProduits.includes(produit._id)}
                onChange={() => toggleChecked(produit._id)}
                className="mr-2"
              />
              <span className={checkedProduits.includes(produit._id) ? 'line-through text-gray-400' : ''}>
                {produit.nom} - Quantité :
                <input
                  type="number"
                  value={produit.quantite}
                  onChange={(e) => modifierQuantite(produit._id, e.target.value)}
                  className="w-16 border border-gray-300 rounded mx-2 p-1"
                  min="1"
                />
              </span>
            </div>
            <button
              onClick={() => supprimerProduit(produit._id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-200 ease-in-out"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <div className="flex w-full max-w-lg">
        <input
          type="text"
          value={nouveauProduit.nom}
          onChange={(e) => setNouveauProduit({ ...nouveauProduit, nom: e.target.value })}
          placeholder="Nom du produit"
          className="border border-gray-300 rounded p-2 mr-2 flex-1"
        />
        <input
          type="number"
          value={nouveauProduit.quantite}
          onChange={(e) => setNouveauProduit({ ...nouveauProduit, quantite: e.target.value })}
          placeholder="Quantité"
          className="border border-gray-300 rounded p-2 mr-2 w-24"
          min="1"
        />
        <button
          onClick={ajouterProduit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200 ease-in-out"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}

export default App;
