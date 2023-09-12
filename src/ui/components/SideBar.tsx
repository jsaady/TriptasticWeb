import { createContext, useCallback, useContext, useState } from 'react';

export interface CoreSidebarItem {
  label: string;
  icon: string;
}

export interface LinkSidebarItem extends CoreSidebarItem {
  link: string;
}

export interface OnClickSidebarItem extends CoreSidebarItem {
  onClick: () => void;
}


export interface InternalSidebarState {
  open: boolean;
  items: (LinkSidebarItem|OnClickSidebarItem)[];
  activeItem: null|LinkSidebarItem|OnClickSidebarItem;
}

export interface SidebarState {
  readonly open: boolean;
  readonly toggle: () => void;
  readonly items: (LinkSidebarItem|OnClickSidebarItem)[];
  readonly setItems: (items: (LinkSidebarItem|OnClickSidebarItem)[]) => void;
  readonly setActiveItem: (items: LinkSidebarItem|OnClickSidebarItem) => void;
}

const SidebarContext = createContext<SidebarState>(null as any);

export const withSidebar = <T extends React.JSX.IntrinsicAttributes>(Comp: React.ComponentType<T>) => (props: T) => {
  const [sidebarState, setSidebarState] = useState<InternalSidebarState>({
    open: false,
    items: [],
    activeItem: null,
  });

  const toggle = useCallback(() => {
    setSidebarState(s => ({
      ...s,
      open: !s.open
    }));
  }, [setSidebarState]);

  const setItems = useCallback((items: (LinkSidebarItem|OnClickSidebarItem)[]) => {
    setSidebarState(s => ({
      ...s,
      items
    }));
  }, [setSidebarState]);

  const setActiveItem = useCallback((item: LinkSidebarItem|OnClickSidebarItem) => {
    setSidebarState(s => ({
      ...s,
      activeItem: item
    }));
  }, [setSidebarState]);

  return <SidebarContext.Provider value={{
    open: sidebarState.open,
    toggle,
    setItems,
    setActiveItem,
    items: sidebarState.items
  }}>
    <Comp {...props} />
  </SidebarContext.Provider>
};

export const useSidebar = () => useContext(SidebarContext);

export const Sidebar = () => {
  const sidebarState = useSidebar();

  if (!sidebarState) throw new Error('Sidebar component used outside of SidebarContext');

  return (
    <div className={`flex flex-col min-h-[90vh] w-64 border-neutral-200 dark:border-neutral-700 ${sidebarState.items.length ? 'flex' : 'hidden'}`}>
      <div className='flex flex-col flex-grow overflow-y-auto'>
        {sidebarState.items.map((item, i) => (
          <div key={i}>{item.label}</div>
        ))}
      </div>
    </div>
  )
};
