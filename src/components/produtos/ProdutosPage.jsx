import { useState, useEffect } from 'react';
import { Plus, RefreshCw, ShoppingCart } from 'lucide-react';
import {
  getProdutos,
  criarProduto,
  atualizarProduto,
  deletarProduto,
} from '../../services/produtoService';
import { getCategorias } from '../../services/categoriaService';
import { useToast } from '../../hooks/useToast';
import ProdutoTable from './ProdutoTable';
import ProdutoFormModal from './ProdutoFormModal';
import ProdutoDeleteDialog from './ProdutoDeleteDialog';
import DetalheModal from './DetalheModal';

function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetalheModalOpen, setIsDetalheModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [produtoDeletando, setProdutoDeletando] = useState(null);
  const [produtoDetalhes, setProdutoDetalhes] = useState(null);

  const toast = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [dadosProdutos, dadosCategorias] = await Promise.all([
        getProdutos(),
        getCategorias().catch(() => []),
      ]);
      setProdutos(dadosProdutos);
      setCategorias(dadosCategorias);
    } catch (error) {
      toast.error('Não foi possível carregar os dados.');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNovo = () => {
    setProdutoEditando(null);
    setIsFormModalOpen(true);
  };

  const handleEditar = (produto) => {
    setProdutoEditando(produto);
    setIsFormModalOpen(true);
  };

  // Handler que abre o modal de detalhes para um produto específico
  const handleVerDetalhes = (produto) => {
    setProdutoDetalhes(produto);  // Define qual produto terá detalhes visualizados
    setIsDetalheModalOpen(true);  // Abre o modal
  };

  const handleSalvar = async (produto) => {
    try {
      if (produtoEditando) {
        await atualizarProduto(produto);
        toast.success(`Produto "${produto.nome}" atualizado com sucesso!`);
      } else {
        await criarProduto(produto);
        toast.success(`Produto "${produto.nome}" cadastrado com sucesso!`);
      }
      setIsFormModalOpen(false);
      setProdutoEditando(null);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao salvar o produto. Verifique os dados e tente novamente.');
      console.error('Erro ao salvar:', error);
    }
  };

  const handleConfirmarDelete = (produto) => {
    setProdutoDeletando(produto);
    setIsDeleteDialogOpen(true);
  };

  const handleDeletar = async () => {
    try {
      await deletarProduto(produtoDeletando.id);
      toast.success(`Produto "${produtoDeletando.nome}" removido com sucesso!`);
      setIsDeleteDialogOpen(false);
      setProdutoDeletando(null);
      await carregarDados();
    } catch (error) {
      toast.error('Erro ao deletar o produto.');
      console.error('Erro ao deletar:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Produtos</h1>
            <p className="text-sm text-gray-500">
              {produtos.length}{' '}
              {produtos.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={carregarDados}
            title="Recarregar lista"
            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleNovo}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          <span className="ml-3 text-gray-500">Carregando produtos...</span>
        </div>
      ) : (
        <ProdutoTable
          produtos={produtos}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEditar={handleEditar}
          onDeletar={handleConfirmarDelete}
          onVerDetalhes={handleVerDetalhes}
        />
      )}

      <ProdutoFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setProdutoEditando(null);
        }}
        produtoEditando={produtoEditando}
        onSalvar={handleSalvar}
        categorias={categorias}
      />

      <ProdutoDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setProdutoDeletando(null);
        }}
        onConfirm={handleDeletar}
        produto={produtoDeletando}
      />

      {/* Modal de Detalhes do Produto (relacionamento 1-para-1) */}
      <DetalheModal
        isOpen={isDetalheModalOpen}
        onClose={() => {
          setIsDetalheModalOpen(false);
          setProdutoDetalhes(null);
        }}
        produto={produtoDetalhes}
      />
    </div>
  );
}

export default ProdutosPage;
