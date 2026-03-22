// src/App.jsx
import { useState, useEffect } from 'react';
import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from './services/produtoService';
import ProdutoForm from './components/ProdutoForm';
import ProdutoList from './components/ProdutoList';

function App() {
  const [produtos, setProdutos] = useState([]);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [erro, setErro] = useState('');

  // Carrega a lista de produtos ao montar o componente
  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const data = await getProdutos();
      setProdutos(data);
      setErro('');
    } catch (error) {
      setErro(
        'Não foi possível carregar os produtos. Verifique se a API está rodando.'
      );
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const handleSalvar = async (produto) => {
    try {
      if (produtoEditando) {
        // Atualizar produto existente
        await atualizarProduto(produto);
        setProdutoEditando(null);
      } else {
        // Criar novo produto
        await criarProduto(produto);
      }
      // Recarrega a lista após salvar
      await carregarProdutos();
      setErro('');
    } catch (error) {
      setErro('Erro ao salvar o produto. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar:', error);
    }
  };

  const handleEditar = (produto) => {
    setProdutoEditando(produto);
  };

  const handleCancelar = () => {
    setProdutoEditando(null);
  };

  const handleDeletar = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este produto?')) {
      try {
        await deletarProduto(id);
        // Recarrega a lista após deletar
        await carregarProdutos();
        setErro('');
      } catch (error) {
        setErro('Erro ao deletar o produto.');
        console.error('Erro ao deletar:', error);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.titulo}>CRUD de Produtos</h1>

      {erro && <div style={styles.erro}>{erro}</div>}

      <ProdutoForm
        produtoEditando={produtoEditando}
        onSalvar={handleSalvar}
        onCancelar={handleCancelar}
      />

      <ProdutoList
        produtos={produtos}
        onEditar={handleEditar}
        onDeletar={handleDeletar}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  titulo: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  erro: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px',
    textAlign: 'center',
  },
};

export default App;